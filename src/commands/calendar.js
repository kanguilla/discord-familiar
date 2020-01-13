"use strict";
exports.__esModule = true;
var googleapis_1 = require("googleapis");
var fs = require("fs");
var Calendar = /** @class */ (function () {
    function Calendar() {
        this.clientId = 'YOUR_CLIENT_ID';
        this.apiKey = 'YOUR_API_KEY';
        this.SCOPES = 'https://www.googleapis.com/auth/calendar';
        this.TOKEN_PATH = 'token.json';
        this.calendar = googleapis_1.google.calendar('v3');
    }
    Calendar.myEvents = function (client) {
        var eventsChannel = client.channels.get("663604642449588254");
        if (eventsChannel) {
            eventsChannel.fetchMessages().then(function (value) {
                value.forEach(function (element) {
                    console.error(element);
                });
            });
        }
        fs.readFile('credentials.json', function (err, content) {
            if (err)
                return console.log('Error loading client secret file:', err);
            // Authorize a client with credentials, then call the Google Calendar API.
            var event = {
                'summary': 'TEST-ignore',
                'location': 'Toronto',
                'description': 'Some meetup',
                'start': {
                    'dateTime': '2020-01-25T09:00:00-07:00',
                    'timeZone': 'America/New_York'
                },
                'end': {
                    'dateTime': '2020-01-25T09:00:00-12:00',
                    'timeZone': 'America/New_York'
                }
            };
            authorize(JSON.parse(content.toString()), addEvent, event);
        });
    };
    /**
     * Create an OAuth2 client with the given credentials, and then execute the
     * given callback function.
     * @param {Object} credentials The authorization client credentials.
     * @param {function} callback The callback to call with the authorized client.
     */
    Calendar.prototype.authorize = function (credentials, callback, body) {
        var _a = credentials.installed, client_secret = _a.client_secret, client_id = _a.client_id, redirect_uris = _a.redirect_uris;
        var oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, function (err, token) {
            if (err)
                return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token.toString()));
            callback(oAuth2Client, body);
        });
    };
    /**
     * Get and store new token after prompting for user authorization, and then
     * execute the given callback with the authorized OAuth2 client.
     * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
     * @param {getEventsCallback} callback The callback for the authorized client.
     */
    Calendar.prototype.getAccessToken = function (oAuth2Client, callback) {
        var authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES
        });
        console.log('Authorize this app by visiting this url:', authUrl);
        var rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question('Enter the code from that page here: ', function (code) {
            rl.close();
            oAuth2Client.getToken(code, function (err, token) {
                if (err)
                    return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(token), function (err) {
                    if (err)
                        return console.error(err);
                    console.log('Token stored to', TOKEN_PATH);
                });
                callback(oAuth2Client);
            });
        });
    };
    /**
     * Lists the next 10 events on the user's primary calendar.
     * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
     */
    Calendar.prototype.listEvents = function (auth) {
        var calendar = googleapis_1.google.calendar({ version: 'v3', auth: auth });
        calendar.events.list({
            calendarId: 'mdojifv6ak57hrgnee80rfngp8@group.calendar.google.com',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime'
        }, function (err, res) {
            if (err)
                return console.log('The API returned an error: ' + err);
            if (res) {
                var events = res.data.items;
                if (events && events.length) {
                    console.log('Upcoming 10 events:');
                    events.map(function (event, i) {
                        if (event.start) {
                            var start = event.start.dateTime || event.start.date;
                            console.log(start + " - " + event.summary);
                        }
                    });
                }
                else {
                    console.log('No upcoming events found.');
                }
            }
        });
    };
    Calendar.prototype.addEvent = function (auth, event) {
        var calendar = googleapis_1.google.calendar({ version: 'v3', auth: auth });
        calendar.events.insert({
            calendarId: 'mdojifv6ak57hrgnee80rfngp8@group.calendar.google.com',
            requestBody: event
        }, function (err, event) {
            if (err)
                return console.log('The API returned an error: ' + err);
            if (event) {
                console.log('Event created: %s', event.htmlLink);
            }
        });
    };
    return Calendar;
}());
exports.Calendar = Calendar;
