import { Command } from './command';
import { Client, TextChannel, MessageEmbedField } from 'discord.js';
import { google, calendar_v3 } from 'googleapis';
import * as fs from 'fs';
import * as readline from 'readline';

export class Calendar implements Command {

    private SCOPES = 'https://www.googleapis.com/auth/calendar';
    private TOKEN_PATH = 'token.json';
    private CALENDAR_ID = "uj1gn8v23a59g3rpf11gdspa1c@group.calendar.google.com";
    private calendar = google.calendar('v3');
    private months: Array<String> = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    private convertTime(time: String, offset: any) {
        var splitTime = time.split(" ");
        var monthIndex = this.months.indexOf(splitTime[1]) + 1;
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

    public updateGCALEvents(client: Client) {

        var eventsChannel = client.channels.get("657828168077541376") as TextChannel;

        if (eventsChannel) {
            eventsChannel.fetchMessages().then(value => {
                var oAuth2Client = new google.auth.OAuth2(
                    "162746195505-9331k9khn4tp10j8vc7um5cgeorfpotu.apps.googleusercontent.com",
                    "ajIuwTt-mvoU4deyLtjvjWgw",
                    "urn:ietf:wg:oauth:2.0:oob");

                fs.readFile(this.TOKEN_PATH, (err, token) => {
                    oAuth2Client.setCredentials(JSON.parse(token.toString()));
                    var auth = oAuth2Client;
                    //clear current events
                    const calendar = google.calendar({ version: 'v3', auth });
                    calendar.calendars.clear({ calendarId: "uj1gn8v23a59g3rpf11gdspa1c@group.calendar.google.com" });
                    //add fresh events
                    value.forEach(element => {
                        element.embeds.forEach(embed => {
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
                            this.addEvent(oAuth2Client, event);
                        });
                    });
                });
            });
        }
    }

    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    public authorize(credentials: any, callback: any, body: any) {
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // Check if we have previously stored a token.
        fs.readFile(this.TOKEN_PATH, (err, token) => {
            if (err) return this.getAccessToken(oAuth2Client, callback);
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
    private getAccessToken(oAuth2Client: any, callback: any) {
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
            oAuth2Client.getToken(code, (err: any, token: any) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(this.TOKEN_PATH, JSON.stringify(token), (err) => {
                    if (err) return console.error(err);
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
    private listEvents(auth: any) {
        const calendar = google.calendar({ version: 'v3', auth });
        calendar.events.list({
            calendarId: this.CALENDAR_ID,
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
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

    private addEvent(auth: any, event: any) {
        var calendar = google.calendar({ version: 'v3', auth });

        calendar.events.insert({
            calendarId: this.CALENDAR_ID,
            requestBody: event,
        }, (err: any, result: any) => {
            if (err) return console.log('The API returned an error creating event for s%: s%', event.summary, err);
            if (result) {
                console.log('Event created for s%: %s', event.summary, result.htmlLink);
            }
        });
    }
}