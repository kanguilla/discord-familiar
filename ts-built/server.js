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
var prefix = ">>";
var client = new discord_js_1.Client({ disableEveryone: true });
function init() {
    client = new discord_js_1.Client({ disableEveryone: true });
    client.on("ready", () => __awaiter(this, void 0, void 0, function* () {
        console.log("Familiar wakes up.");
    }));
    client.on("message", (message) => __awaiter(this, void 0, void 0, function* () {
        if (message.author.bot)
            return;
        if (message.channel.type === "dm")
            return;
        var messageArray = message.content.split(" ");
        var cmd = messageArray[0];
        var args = messageArray.slice(1);
        if (cmd.startsWith(prefix)) {
            parseCmd(message, cmd.substring(prefix.length), args);
        }
    }));
    client.login("NjYzMjMxMzY0MjUzODc2MjI1.XhK3TA.DhJefDCLaMqPGl2RJy8d2z3F714");
}
init();
function parseCmd(message, cmd, args) {
    switch (cmd) {
        case "hello":
            message.channel.send("Hello " + message.author.username + ".");
            return;
        case "calendar":
            var calendar = new calendar_1.Calendar();
            calendar.myEvents(client);
            break;
        default:
            message.channel.send("I don't know how to do that...yet.");
            return;
    }
}
