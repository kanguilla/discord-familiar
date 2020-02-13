import { Command } from "./command";
import { Client, TextChannel, Message, Channel } from "discord.js";
import * as fs from 'fs';
import { dataflow } from "googleapis/build/src/apis/dataflow";

export class Affirm implements Command {

    private static DATA_PATH = 'affirmations.json';

    private data: any;

    public static createInstance() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.DATA_PATH, (err, content: Buffer) => {
                if (err) {
                    reject(err);
                }
                var string: string = content.toString();
                var newAffirm = new Affirm();
                newAffirm.data = JSON.parse(string);
                console.log("Affirmation instance created.")
                resolve(newAffirm);
            });
        });
    }

    public affirmMe(message: Message) {
        var selected = this.data.affirmations[Math.floor(Math.random() * this.data.affirmations.length)];
        var phrasings = [
            message.author.username + ", say this to yourself",
            "Here you go, " + message.author.username,
            "This helps me get through the day",
            "Hey! Listen up",
            message.author.username + ". I think you should say this",
            "Its great to hear from you " + message.author.username + ". Why don't you say this for me",
            "Hey " + message.author.username + "! Say this for me",
            "Say this out loud",
            "Read these words, " + message.author.username,
            "I found this. I think you should say it out loud",
            "I'm here for you " + message.author.username + ". Say this for me",
            "How are you doing? With me now",
            "Somebody told me to tell you to say this",
            "𝙝𝙤𝙤𝙩. Say this with me",
            "With me now...1...2...3 ",
            ":green_heart: " + message.author.username + "! Lets say this together"
        ];
        var index = Math.floor(Math.random() * phrasings.length);
        message.author.send(phrasings[index] + ":\n> " + selected);
    }
}