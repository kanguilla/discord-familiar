import { Client, Message } from 'discord.js'
import { Calendar } from './commands/calendar';
import { WhoIs } from './commands/whois';
import { Affirm } from './commands/affirm';
import { Spin } from './commands/spin';
import * as fs from 'fs';

var client: Client;
var EVENT_CHANNEL_ID;
var BOT_TOKEN;
var PREFIX = ">>";
var CALENDAR_ID = 'torontodiscord@gmail.com';
var SKILLS = [
    "  > manage google calendar events @ http://tiny.cc/od46iz"
];
var TIMEOUT = 10;
var CONFIG_PATH = 'config.json';
var calendar: Calendar;
var affirm: Affirm;
var spin: Spin;
var adding: boolean = false;
var messageQueue: Array<Message>;
var events = 0;
var timer;

function init() {

    var promises: Promise<any>[] = [];
    promises.push(Calendar.createInstance(CALENDAR_ID));
    promises.push(Affirm.createInstance());
    promises.push(Spin.createInstance());

    promises.push(new Promise((resolve, reject) => {
        fs.readFile(CONFIG_PATH, (err, token) => {
            if (err) {
                reject(err);
            }
            var content: any = JSON.parse(token.toString());
            EVENT_CHANNEL_ID = content.discord.eventChannelID;
            BOT_TOKEN = content.discord.token;
            console.log("Config loaded.")
            resolve();
        });
    }));


    Promise.all(promises).then(values => {
        calendar = values[0] as Calendar;
        affirm = values[1] as Affirm;
        spin = values[2] as Spin;
        client = new Client({ disableEveryone: true });
        client.on("ready", async () => {
            console.log("Familiar wakes up.");
            client.user.setPresence({
                game: {
                    name: '>>help',
                    type: "STREAMING"
                }
            });
        });

        client.on("message", async (message: Message) => {
            if (!message.author.bot) {

                var messageArray = message.content.split(" ");
                var cmd = messageArray[0];
                var args = messageArray.slice(1);
                var isDM = message.channel.type === "dm";
                var isCMD = cmd.startsWith(PREFIX);

                if (isDM && isCMD) {
                    parseDMCmd(message, cmd.substring(PREFIX.length), args);
                }

                if (!isDM && isCMD) {
                    parseCmd(message, cmd.substring(PREFIX.length), args);
                }

                if (isDM && !isCMD && message.content.toLowerCase().indexOf("affirm") > -1) {
                    affirm.affirmMe(message);
                }

            } else {
                if (message.channel.id === EVENT_CHANNEL_ID) {

                    var counter = 0;

                    clearInterval(timer);

                    console.log("Apollo posted an event: " + message.embeds[0].title);

                    timer = setInterval(() => {
                        console.error("Waiting " + counter + " seconds...");
                        counter++;
                        if (counter > 10) {
                            clearInterval(timer);

                            calendar.clearAllEvents().then(value => {
                                calendar.postEventsFromChannel(EVENT_CHANNEL_ID, client).then(value => {
                                    adding = false;
                                });
                            });
                        }
                    }, 1000);
                }
            }
        });
        client.login(BOT_TOKEN);

    }, reasons => {
        console.error("Something went wrong while waking up:\n" + reasons.join("\n"))
    });
}

init();

function parseDMCmd(message: Message, cmd: String, args: String[]) {
    switch (cmd) {
        case "spin":
            spin.registerSpin(message, args);
            break;
        case "spindata":
            spin.displaySpinData(message, args, client);
            break;
        default:
            message.channel.send("I don't know how to do that...yet.")
            return;
    }
}

function parseCmd(message: Message, cmd: String, args: String[]) {
    switch (cmd) {
        case "help":
            message.channel.send("I'm here to help.\n> >>hello\n> >>jobs");
            break;
        case "jobs":
            message.channel.send("Right now, I am configured to:\n" + SKILLS.join("\n>"));
            break;
        case "hello":
            message.channel.send("Hello " + message.author.username + ".")
            break;
        case "say":
            if (!message.member) break;
            var admin = message.member.hasPermission("ADMINISTRATOR");
            if (args.length < 2) {
                break;
            }
            WhoIs.say(args, client);
            break;
        // case "whois":
        //     message.delete();
        //     if (args.length < 1) {
        //         break;
        //     }
        //     WhoIs.whoIs(args, message, client);
        //     break;
        case "reset":
            if (!message.member) break;
            var admin = message.member.hasPermission("ADMINISTRATOR");
            if (admin) {
                calendar.clearAllEvents().then(value => {
                    calendar.postEventsFromChannel(EVENT_CHANNEL_ID, client);
                });
            }
            break;
        default:
            message.channel.send("I don't know how to do that...yet.")
            return;
    }
}