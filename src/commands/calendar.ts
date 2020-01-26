import { Command } from './command';
import { Client, TextChannel } from 'discord.js';
import { google, calendar_v3 } from 'googleapis';
import * as fs from 'fs';

export class Calendar implements Command {

    private static SCOPES = 'https://www.googleapis.com/auth/calendar';
    private static TOKEN_PATH = 'token.json';
    private static MONTHS: Array<String> = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    private oAuth2Client;
    private calendarId: string = "";

    public static createInstance(calendarId:string) {
        return new Promise((resolve, reject) => {
            fs.readFile(this.TOKEN_PATH, (err, token) => {
                if (err) {
                    reject(err);
                }
                var newCalendar = new Calendar();
                newCalendar.calendarId = calendarId;
                newCalendar.oAuth2Client = new google.auth.OAuth2(
                    "162746195505-9331k9khn4tp10j8vc7um5cgeorfpotu.apps.googleusercontent.com",
                    "ajIuwTt-mvoU4deyLtjvjWgw",
                    "urn:ietf:wg:oauth:2.0:oob");
                newCalendar.oAuth2Client.setCredentials(JSON.parse(token.toString()));
                console.log("Calendar instance created.")
                resolve(newCalendar);
            });
        });
    }

    private convertTime(time: String, offset: any) {
        var splitTime = time.split(" ");
        var monthIndex = Calendar.MONTHS.indexOf(splitTime[1]) + 1;
        var monthString: string = "" + monthIndex;
        if (monthIndex < 10) monthString = "0" + monthString;
        var day = splitTime[2].substr(0, splitTime[2].length - 3);
        var dayString: string = "" + day;
        if (day.length < 2) dayString = "0" + dayString;
        var hour = parseInt(splitTime[5].split(":")[0]) + offset;
        var minute = splitTime[5].split(":")[1];
        if (splitTime[6] === 'PM') {
            hour = hour + 12;
        }
        var hourString: string = "0" + hour;
        if (hourString.length > 2) hourString = hourString.substr(1);
        var output = splitTime[3] + "-" + monthString + "-" + dayString + "T" + hourString + ":" + minute + ":00-05:00";
        return output;
    }

    public postEventsFromChannel(channelId: string, client: Client) {
        var eventsChannel = client.channels.get(channelId) as TextChannel;
        if (eventsChannel) {
            eventsChannel.fetchMessages().then(value => {
                value.forEach(element => {
                    element.embeds.forEach(embed => {
                        this.addEvent(embed);
                    });
                });
            });
        }
    }

    private listEvents(auth: any, limit) {
        const calendar = google.calendar({ version: 'v3', auth });
        calendar.events.list({
            calendarId: this.calendarId,
            timeMin: (new Date()).toISOString(),
            maxResults: limit,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            if (err) return console.log('The API returned an error.');
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
                } else {
                    console.log('No upcoming events found.');
                }
            }
        });
    }

    public addEvent(embed) {
        var time: string = embed.fields[0].value;
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

        var auth = this.oAuth2Client;
        var calendar = google.calendar({ version: 'v3', auth });
        calendar.events.insert({
            calendarId: this.calendarId,
            requestBody: event,
        }, (err: any, result: any) => {
            if (err) return console.log('The API returned an error creating event for ', event.summary);
            if (result) {
                console.log('Event created for %s: %s', event.summary, result.htmlLink);
            }
        });
    }

    public clearAllEvents(){
        return new Promise((resolve, reject) => {
            var auth = this.oAuth2Client;
            var calendar = google.calendar({ version: 'v3', auth });
            calendar.calendars.clear({calendarId:'primary'}).then(value => {
                resolve(value);
            }, reason =>{
                reject(reason);
            });
        });
    }

    // /**
    //  * Get and store new token after prompting for user authorization, and then
    //  * execute the given callback with the authorized OAuth2 client.
    //  * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
    //  * @param {getEventsCallback} callback The callback for the authorized client.
    //  */
    // private getAccessToken(oAuth2Client: any, callback: any) {
    //     const authUrl = oAuth2Client.generateAuthUrl({
    //         access_type: 'offline',
    //         scope: this.SCOPES,
    //     });
    //     console.log('Authorize this app by visiting this url:', authUrl);
    //     const rl = readline.createInterface({
    //         input: process.stdin,
    //         output: process.stdout,
    //     });
    //     rl.question('Enter the code from that page here: ', (code) => {
    //         rl.close();
    //         oAuth2Client.getToken(code, (err: any, token: any) => {
    //             if (err) return console.error('Error retrieving access token', err);
    //             oAuth2Client.setCredentials(token);
    //             // Store the token to disk for later program executions
    //             fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
    //                 if (err) return console.error(err);
    //                 console.log('Token stored to', this.TOKEN_PATH);
    //             });
    //             callback(oAuth2Client);
    //         });
    //     });
    // }
}