import { Client, Message } from 'discord.js'
import { Calendar } from './commands/calendar';
import { WhoIs } from './commands/whois';
import { Affirm } from './commands/affirm';

var client: Client;
var EVENT_CHANNEL_ID = '657828168077541376';
var PREFIX = ">>";
var CALENDAR_ID = 'torontodiscord@gmail.com';
var SKILLS = [
    "  > manage google calendar events @ http://tiny.cc/od46iz"
];
var TIMEOUT = 10;

//var CALENDAR_ID = "j1s1e3d9p5s2f8l9d1uq13evbc@group.calendar.google.com";

var calendar: Calendar;
var affirm: Affirm;
var adding: boolean = false;
var messageQueue: Array<Message>;
var events = 0;
var timer;

function init() {

    var promises: Promise<any>[] = [];
    promises.push(Calendar.createInstance(CALENDAR_ID));
    promises.push(Affirm.createInstance());

    Promise.all(promises).then(values => {
        calendar = values[0] as Calendar;
        affirm = values[1] as Affirm;

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
        client.login("NjYzMjMxMzY0MjUzODc2MjI1.XhK3TA.DhJefDCLaMqPGl2RJy8d2z3F714");

    }, reasons => {

    });
}

init();

function parseCmd(message: Message, cmd: String, args: String[]) {
    var admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
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
            if (args.length < 2) {
                break;
            }
            WhoIs.say(args, client);
            break;
        case "whois":
            message.delete();
            if (args.length < 1) {
                break;
            }
            WhoIs.whoIs(args, message, client);
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