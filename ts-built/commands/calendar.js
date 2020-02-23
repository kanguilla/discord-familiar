"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const googleapis_1 = require("googleapis");
const fs = __importStar(require("fs"));
class Calendar {
    constructor() {
        this.calendarId = "";
    }
    static createInstance(calendarId) {
        return new Promise((resolve, reject) => {
            fs.readFile(this.TOKEN_PATH, (err, token) => {
                if (err) {
                    reject(err);
                }
                var newCalendar = new Calendar();
                newCalendar.calendarId = calendarId;
                newCalendar.oAuth2Client = new googleapis_1.google.auth.OAuth2("162746195505-9331k9khn4tp10j8vc7um5cgeorfpotu.apps.googleusercontent.com", "ajIuwTt-mvoU4deyLtjvjWgw", "urn:ietf:wg:oauth:2.0:oob");
                newCalendar.oAuth2Client.setCredentials(JSON.parse(token.toString()));
                console.log("Calendar instance created.");
                resolve(newCalendar);
            });
        });
    }
    convertTime(time, offset) {
        var splitTime = time.split(" ");
        var monthIndex = Calendar.MONTHS.indexOf(splitTime[1]) + 1;
        var monthString = "" + monthIndex;
        if (monthIndex < 10)
            monthString = "0" + monthString;
        var day = splitTime[2].substr(0, splitTime[2].length - 3);
        var dayString = "" + day;
        if (day.length < 2)
            dayString = "0" + dayString;
        var hour = parseInt(splitTime[5].split(":")[0]) + offset;
        var minute = splitTime[5].split(":")[1];
        if (splitTime[6] === 'PM') {
            hour = hour + 12;
        }
        var hourString = "0" + hour;
        if (hourString.length > 2)
            hourString = hourString.substr(1);
        if (hourString == '24')
            hourString = '00';
        var output = splitTime[3] + "-" + monthString + "-" + dayString + "T" + hourString + ":" + minute + ":00-05:00";
        return output;
    }
    postEventsFromChannel(channelId, client) {
        return new Promise((resolve, reject) => {
            var eventsChannel = client.channels.get(channelId);
            if (eventsChannel) {
                eventsChannel.fetchMessages({ limit: 100 }).then(value => {
                    value.forEach(element => {
                        element.embeds.forEach(async (embed) => {
                            await this.addEvent(embed);
                        });
                    });
                });
            }
            resolve();
        });
    }
    listEvents(auth, limit) {
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
        calendar.events.list({
            calendarId: this.calendarId,
            timeMin: (new Date()).toISOString(),
            maxResults: limit,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            if (err)
                return console.log('The API returned an error.');
            if (res) {
                const events = res.data.items;
                if (events && events.length) {
                    console.log('Upcoming 10 events:');
                    events.map((event, i) => {
                        if (event.start) {
                            const start = event.start.dateTime || event.start.date;
                            console.log(`${start} - ${event.summary}`);
                        }
                    });
                }
                else {
                    console.log('No upcoming events found.');
                }
            }
        });
    }
    addEvent(embed) {
        return new Promise((resolve, reject) => {
            var time = embed.fields[0].value;
            var startTime = this.convertTime(time, 0);
            var endTime = this.convertTime(time, 1);
            var event = {
                'summary': embed.title,
                'description': embed.description,
                'start': {
                    'dateTime': startTime,
                    'timeZone': 'America/New_York',
                },
                'end': {
                    'dateTime': endTime,
                    'timeZone': 'America/New_York',
                }
            };
            console.log(event);
            var auth = this.oAuth2Client;
            var calendar = googleapis_1.google.calendar({ version: 'v3', auth });
            calendar.events.insert({
                calendarId: this.calendarId,
                requestBody: event,
            }, (err, result) => {
                if (err) {
                    console.error('The API returned an error creating event for ' + event.summary);
                    reject(err);
                }
                if (result) {
                    console.log('Event created for %s: %s', event.summary, event.end.dateTime);
                    resolve(result);
                }
            });
        });
    }
    clearAllEvents() {
        return new Promise((resolve, reject) => {
            var auth = this.oAuth2Client;
            var calendar = googleapis_1.google.calendar({ version: 'v3', auth });
            calendar.calendars.clear({ calendarId: 'primary' }).then(value => {
                resolve(value);
            }, reason => {
                reject(reason);
            });
        });
    }
}
exports.Calendar = Calendar;
Calendar.SCOPES = 'https://www.googleapis.com/auth/calendar';
Calendar.TOKEN_PATH = 'token.json';
Calendar.MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
