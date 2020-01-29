"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const calendar_1 = require("./commands/calendar");
var client;
var EVENT_CHANNEL_ID = '657828168077541376';
var PREFIX = ">>";
var CALENDAR_ID = 'torontodiscord@gmail.com';
var SKILLS = [
    "  > manage google calendar events @ http://tiny.cc/od46iz"
];
var TIMEOUT = 10;
//var CALENDAR_ID = "j1s1e3d9p5s2f8l9d1uq13evbc@group.calendar.google.com";
var calendar;
var adding = false;
var messageQueue;
var events = 0;
var timer;
function init() {
    calendar_1.Calendar.createInstance(CALENDAR_ID).then(value => {
        calendar = value;
        client = new discord_js_1.Client({ disableEveryone: true });
        client.on("ready", () => __awaiter(this, void 0, void 0, function* () {
            console.log("Familiar wakes up.");
            client.user.setPresence({
                game: {
                    name: '>>help',
                    type: "STREAMING"
                }
            });
        }));
        client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
            if (!message.author.bot) {
                if (message.channel.type === "dm")
                    return;
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
                    // calendar.clearAllEvents().then(value => {
                    //     calendar.postEventsFromChannel(EVENT_CHANNEL_ID, client).then(value => {
                    //         adding = false;
                    //     });
                    // });
                    // message.embeds.forEach(embed => {
                    //     calendar.addEvent(embed);
                    // });
                }
            }
        }));
        client.login("NjYzMjMxMzY0MjUzODc2MjI1.XhK3TA.DhJefDCLaMqPGl2RJy8d2z3F714");
    });
}
init();
function parseCmd(message, cmd, args) {
    var admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
    switch (cmd) {
        case "help":
            message.channel.send("Hello " + message.author.username + ". Right now, I am configured to:\n" + SKILLS.join("\n  >"));
            break;
        case "hello":
            message.channel.send("Hello " + message.author.username + ".");
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
