"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const calendar_1 = require("./commands/calendar");
const whois_1 = require("./commands/whois");
const affirm_1 = require("./commands/affirm");
const fs = __importStar(require("fs"));
var client;
var EVENT_CHANNEL_ID;
var BOT_TOKEN;
var PREFIX = ">>";
var CALENDAR_ID = 'torontodiscord@gmail.com';
var SKILLS = [
    "  > manage google calendar events @ http://tiny.cc/od46iz"
];
var TIMEOUT = 10;
var CONFIG_PATH = 'config.json';
var calendar;
var affirm;
var adding = false;
var messageQueue;
var events = 0;
var timer;
function init() {
    var promises = [];
    promises.push(calendar_1.Calendar.createInstance(CALENDAR_ID));
    promises.push(affirm_1.Affirm.createInstance());
    promises.push(new Promise((resolve, reject) => {
        fs.readFile(CONFIG_PATH, (err, token) => {
            if (err) {
                reject(err);
            }
            var content = JSON.parse(token.toString());
            EVENT_CHANNEL_ID = content.discord.eventChannelID;
            BOT_TOKEN = content.discord.token;
            console.log("Config loaded.");
            resolve();
        });
    }));
    Promise.all(promises).then(values => {
        calendar = values[0];
        affirm = values[1];
        client = new discord_js_1.Client({ disableEveryone: true });
        client.on("ready", async () => {
            console.log("Familiar wakes up.");
            client.user.setPresence({
                game: {
                    name: '>>help',
                    type: "STREAMING"
                }
            });
        });
        client.on("message", async (message) => {
            if (!message.author.bot) {
                if (message.channel.type === "dm") {
                    affirm.affirmMe(message);
                    return;
                }
                var messageArray = message.content.split(" ");
                var cmd = messageArray[0];
                var args = messageArray.slice(1);
                if (cmd.startsWith(PREFIX)) {
                    parseCmd(message, cmd.substring(PREFIX.length), args);
                }
            }
            else {
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
        console.error("Something went wrong while waking up:\n" + reasons.join("\n"));
    });
}
init();
function parseCmd(message, cmd, args) {
    var admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
    switch (cmd) {
        case "help":
            message.channel.send("I'm here to help.\n> >>hello\n> >>jobs");
            break;
        case "jobs":
            message.channel.send("Right now, I am configured to:\n" + SKILLS.join("\n>"));
            break;
        case "hello":
            message.channel.send("Hello " + message.author.username + ".");
            break;
        case "say":
            if (args.length < 2) {
                break;
            }
            whois_1.WhoIs.say(args, client);
            break;
        case "whois":
            message.delete();
            if (args.length < 1) {
                break;
            }
            whois_1.WhoIs.whoIs(args, message, client);
            break;
        case "reset":
            if (admin) {
                calendar.clearAllEvents().then(value => {
                    calendar.postEventsFromChannel(EVENT_CHANNEL_ID, client);
                });
            }
            break;
        default:
            message.channel.send("I don't know how to do that...yet.");
            return;
    }
}
