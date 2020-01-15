import { Client, Message } from 'discord.js'
import { Calendar } from './commands/calendar';

var prefix = ">>";
var client: Client = new Client({ disableEveryone: true });

function init() {
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
        if (message.author.bot) return;
        if (message.channel.type === "dm") return;

        var messageArray = message.content.split(" ");
        var cmd = messageArray[0];
        var args = messageArray.slice(1);

        if (cmd.startsWith(prefix)) {
            parseCmd(message, cmd.substring(prefix.length), args);
        }
    });

    client.login("NjYzMjMxMzY0MjUzODc2MjI1.XhK3TA.DhJefDCLaMqPGl2RJy8d2z3F714");
}

init();

function parseCmd(message: Message, cmd: String, args: String[]) {
    var admin = message.guild.member(message.author).hasPermission("ADMINISTRATOR");
    switch (cmd) {
        case "help":
            message.channel.send("Hello " + message.author.username + ".")
            return;
        case "hello":
            message.channel.send("Hello " + message.author.username + ".")
            return;
        case "calendar":
            if (admin){
                var calendar = new Calendar();
                calendar.updateGCALEvents(client);
                break;
            }
        default:
            message.channel.send("I don't know how to do that...yet.")
            return;
    }
}