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
const readline = __importStar(require("readline"));
class Calendar {
    constructor() {
        this.clientId = 'YOUR_CLIENT_ID';
        this.apiKey = 'YOUR_API_KEY';
        this.SCOPES = 'https://www.googleapis.com/auth/calendar';
        this.TOKEN_PATH = 'token.json';
        this.calendar = googleapis_1.google.calendar('v3');
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
    convertTime(time, offset) {
        var splitTime = time.split(" ");
        var monthIndex = this.months.indexOf(splitTime[1]) + 1;
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
        var output = splitTime[3] + "-" + monthString + "-" + dayString + "T" + hourString + ":" + minute + ":00-00:00";
        console.error(output);
        return output;
    }
    myEvents(client) {
        var eventsChannel = client.channels.get("663604642449588254");
        var oAuth2Client;
        if (eventsChannel) {
            eventsChannel.fetchMessages().then(value => {
                value.forEach(element => {
                    element.embeds.forEach(embed => {
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
                        fs.readFile(this.TOKEN_PATH, (err, token) => {
                            const oAuth2Client = new googleapis_1.google.auth.OAuth2("162746195505-9331k9khn4tp10j8vc7um5cgeorfpotu.apps.googleusercontent.com", "ajIuwTt-mvoU4deyLtjvjWgw", "urn:ietf:wg:oauth:2.0:oob");
                            oAuth2Client.setCredentials(JSON.parse(token.toString()));
                            this.addEvent(oAuth2Client, event);
                        });
                    });
                });
            });
        }
        // fs.readFile(this.TOKEN_PATH, (err, token) => {
        //     const oAuth2Client = new google.auth.OAuth2(
        //         "162746195505-9331k9khn4tp10j8vc7um5cgeorfpotu.apps.googleusercontent.com", 
        //         "ajIuwTt-mvoU4deyLtjvjWgw", 
        //         "urn:ietf:wg:oauth:2.0:oob");
        //     oAuth2Client.setCredentials(JSON.parse(token.toString()));
        //     this.addEvent(oAuth2Client, event);
        // });
        // fs.readFile('credentials.json', (err, content) => {
        //     if (err) return console.log('Error loading client secret file:', err);
        //     // Authorize a client with credentials, then call the Google Calendar API.
        //     var event = {
        //         'summary': 'TEST-ignore',
        //         'location': 'Toronto',
        //         'description': 'Some meetup',
        //         'start': {
        //             'dateTime': '2020-01-25T09:00:00-07:00',
        //             'timeZone': 'America/New_York',
        //         },
        //         'end': {
        //             'dateTime': '2020-01-25T09:00:00-12:00',
        //             'timeZone': 'America/New_York',
        //         }
        //     };
        //     authorize(JSON.parse(content.toString()), addEvent, event);
        // });
    }
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    authorize(credentials, callback, body) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err, token) => {
            if (err)
                return this.getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token.toString()));
            callback(oAuth2Client, body);
        });
    }
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    getAccessToken(oAuth2Client, callback) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl.question('Enter the code from that page here: ', (code) => {
            rl.close();
            oAuth2Client.getToken(code, (err, token) => {
                if (err)
                    return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err)
                        return console.error(err);
                    console.log('Token stored to', this.TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    }
    /**
     * Lists the next 10 events on the user's primary calendar.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    listEvents(auth) {
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
        calendar.events.list({
            calendarId: 'mdojifv6ak57hrgnee80rfngp8@group.calendar.google.com',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            if (err)
                return console.log('The API returned an error: ' + err);
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
    addEvent(auth, event) {
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth });
        calendar.events.insert({
            calendarId: 'mdojifv6ak57hrgnee80rfngp8@group.calendar.google.com',
            requestBody: event,
        }, (err, event) => {
            if (err)
                return console.log('The API returned an error: ' + err);
            if (event) {
                console.log('Event created: %s', event.htmlLink);
            }
        });
    }
}
exports.Calendar = Calendar;
