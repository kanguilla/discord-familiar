import { Client, Message } from 'discord.js'
import { Calendar } from './commands/calendar';

var client: Client;
var EVENT_CHANNEL_ID = '657828168077541376';
var PREFIX = ">>";
var CALENDAR_ID = 'torontodiscord@gmail.com';
var SKILLS = [
    "  > manage google calendar events @ http://tiny.cc/od46iz"
];

//var CALENDAR_ID = "j1s1e3d9p5s2f8l9d1uq13evbc@group.calendar.google.com";

var calendar: Calendar;

function init() {

    Calendar.createInstance(CALENDAR_ID).then(value => {

        calendar = value as Calendar;
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
                if (message.channel.type === "dm") return;

                var messageArray = message.content.split(" ");
                var cmd = messageArray[0];
                var args = messageArray.slice(1);

                if (cmd.startsWith(PREFIX)) {
                    parseCmd(message, cmd.substring(PREFIX.length), args);
                }
            } else {
                if (message.channel.id === EVENT_CHANNEL_ID) {
                    console.log("New event posted: " + message);
                    calendar.clearAllEvents().then(value => {
                        calendar.postEventsFromChannel(EVENT_CHANNEL_ID, client);
                    });

                    // message.embeds.forEach(embed => {
                    //     calendar.addEvent(embed);
                    // });
                }
            }
        });
        client.login("NjYzMjMxMzY0MjUzODc2MjI1.XhK3TA.DhJefDCLaMqPGl2RJy8d2z3F714");
    });
}

init();

function parseCmd(message: Message, cmd: String, args: String[]) {
    var admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
    switch (cmd) {
        case "help":
            message.channel.send("Hello " + message.author.username + ". Right now, I am configured to:\n" + SKILLS.join("\n  >"));
            break;
        case "hello":
            message.channel.send("Hello " + message.author.username + ".")
            break;
        case "reset":
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