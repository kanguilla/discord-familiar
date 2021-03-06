"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
class Affirm {
    static createInstance() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.DATA_PATH, (err, content) => {
                if (err) {
                    reject(err);
                }
                var string = content.toString();
                var newAffirm = new Affirm();
                newAffirm.data = JSON.parse(string);
                console.log("Affirmation instance created.");
                resolve(newAffirm);
            });
        });
    }
    affirmMe(message) {
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
exports.Affirm = Affirm;
Affirm.DATA_PATH = 'affirmations.json';
