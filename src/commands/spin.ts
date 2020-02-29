import { Command } from "./command";
import { MongoClient } from "mongodb";
import { Message, MessageCollector, Client } from "discord.js";

export class Spin implements Command {

    private collection;

    public static createInstance() {
        return new Promise((resolve, reject) => {
            var url = 'mongodb://localhost:27017';
            MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                if (err) reject(err);
                console.log("Spin instance created.");
                var newSpin = new Spin();
                newSpin.collection = client.db("tofriends").collection('spinUsers');
                resolve(newSpin);
            });
        });
    }

    public addSpinData(data: any) {
        return new Promise((resolve, reject) => {
            if (!this.collection) return;
            this.collection.insertOne(data, { upsert: true }, (err, res) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    public updateSpinData(query, data: any) {
        return new Promise((resolve, reject) => {
            if (!this.collection) return;
            this.collection.updateOne(query, data, { upsert: true }, (err, res) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    public checkSpinData(query) {
        return new Promise((resolve, reject) => {
            if (!this.collection) return reject();
            this.collection.findOne(query, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    }

    public removeSpinData(query) {
        return new Promise((resolve, reject) => {
            if (!this.collection) return reject();
            this.collection.delete(query, (err, res) => {
                if (err) reject(err);
                resolve();
            });
        });
    }

    public displaySpinData(message, args, client: Client) {
        if (!args || args.length === 0) return;
        var id = client.users.find(user => user.username == args[0]).id;
        this.checkSpinData({ _id: id }).then((value: any) => {
            if (value) {
                message.author.send(JSON.stringify(value));
            } else {
                message.author.send("No data found.");
            }
        });
    }

    public registerSpin(message: Message, args) {
        var confirmed: any = null;
        if (args[0] == 'in') confirmed = true;
        if (args[0] == 'out') confirmed = false;

        if (confirmed === null) {
            message.author.send("Register for SPIN next week? **yes/no**").then(value => {
                message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 60000 }).then(collected => {
                    if (collected.first().content.toLowerCase() == "yes") {
                        this.checkSpinData({ _id: message.author.id }).then((value: any) => {
                            if (value) {
                                this.updateSpinData({ _id: message.author.id }, {
                                    $set:
                                    {
                                        confirmed: true,
                                    }
                                })
                                message.channel.send("𝙝𝙤𝙤𝙩! I'll register you for the next week.");
                                this.addTimeDetails(message);
                            } else {
                                this.addSpinData(
                                    {
                                        _id: message.author.id,
                                        confirmed: false,
                                    });
                                message.channel.send("𝙝𝙤𝙤𝙩! I'll register you for the next week.");
                                this.addTimeDetails(message);

                            }
                        });
                    } else if (collected.first().content.toLowerCase() == "no") {
                        message.channel.send("Find me again if you change your mind.");
                    }
                });
            });
        } else if (!confirmed) {
            this.checkSpinData({ _id: message.author.id }).then((value: any) => {
                if (value && !value.confirmed) {
                    message.author.send("You already aren't set up for spin next week, " + message.author.username + ".");
                } else {
                    message.author.send("Done! I've scratched your name off the list. If you change your mind...");
                    this.updateSpinData({ _id: message.author.id }, {
                        $set:
                        {
                            confirmed: false,
                        }
                    });
                }
            });
        } else if (confirmed && confirmed != null) {
            this.checkSpinData({ _id: message.author.id }).then((value: any) => {
                if (value && value.confirmed) {
                    message.author.send("My data shows you're already confirmed, " + message.author.username + ".");
                } else {
                    message.author.send("𝙝𝙤𝙤𝙩! I'll register you for the next week.");
                    this.updateSpinData({ _id: message.author.id }, {
                        $set:
                        {
                            confirmed: true,
                        }
                    });
                    this.addTimeDetails(message);
                }
            });
        }
    }

    public addTimeDetails(message) {
        message.author.send("In order to match you up better, let me record your availability. We'll do this in one message. Just write down each day of the week you're available, seperated by a space. \n\nOptionally, You can specify morning, afternoon, or evening by putting -m, -a, or -e after the day. Here's a couple examples:\nFor Tuesday and Thursday nights:   **tuesday-e thursday-e**\nFor Sunday morning, Wednesday morning, and all day Friday:   **sunday-m wednesday-m friday**\n\nIf you don't wish to specify your availability, just type **free**.").then(value => {
            message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 60000 }).then(collected => {

                if (collected.first().content.toLowerCase() == 'free') {
                    message.author.send("Perfect.");
                    this.updateSpinData({ _id: message.author.id }, {
                        $set:
                        {
                            available: [],
                        }
                    }).then(value => {
                        this.addGroupSize(message);
                    });
                } else {
                    var data: any[] = [];
                    var output = "";
                    var times: string[];
                    times = collected.first().content.split(" ");
                    times.forEach(time => {
                        var splitted = time.split("-");
                        output += splitted[0].toLowerCase()
                        if (splitted.length > 1) {

                            if (splitted[1] == 'm') {
                                output += " (morning) "
                            } else if (splitted[1] == 'a') {
                                output += " (afternoon) "
                            } else if (splitted[1] == 'e') {
                                output += " (evening) "
                            } else {
                                return;
                            }
                            data.push({ day: splitted[0], time: splitted[1] });
                        } else {
                            ", "
                            data.push({ day: splitted[0], time: null });
                        }
                    });
                    output = output.trim();
                    message.author.send("[" + output + "]. I'll make sure I account for that when I make the matches.");
                    this.updateSpinData({ _id: message.author.id }, {
                        $set:
                        {
                            available: data
                        }
                    }).then(value => {
                        this.addGroupSize(message);
                    });
                }
            })
        });
    }

    public addGroupSize(message) {
        message.author.send("Is there a group size you prefer?").then(value => {
            message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 60000 }).then(collected => {
                if (/^\d+$/.test(collected.first().content) && Number.parseInt(collected.first().content) > 0) {
                    message.author.send("Alright.");
                    this.updateSpinData({ _id: message.author.id }, {
                        $set:
                        {
                            groupSize: collected.first().content
                        }
                    }).then(value => {
                        this.addUserBlocks(message);
                    });
                } else {
                    message.author.send("Hmm that data didn't quite match what I expected. I'm looking for a number. Let's try again:");
                    this.addGroupSize(message);
                }
            });
        });
    }

    public addUserBlocks(message) {
        message.author.send("Lastly, is there anyone you would prefer not to get matched with? Send me a list of names. Otherwise, type **done**.").then(value => {
            message.channel.awaitMessages(m => m.author.id === message.author.id, { maxMatches: 1, time: 60000 }).then(collected => {

                var names: String[] = collected.first().content.split(" ");

                if (collected.first().content.toLowerCase() == 'done') {
                    this.updateSpinData({ _id: message.author.id }, {
                        $set:
                        {
                            blackList: []
                        }
                    }).then(value => {
                        message.author.send("Thanks. I'll let you know when the matches are ready.");
                    });
                } else {
                    this.updateSpinData({ _id: message.author.id }, {
                        $set:
                        {
                            blackList: names
                        }
                    }).then(value => {
                        message.author.send("I'll try not to pair you with [" + names.join(", ") + "]. I'll let you know when the matches are ready.");
                    });
                }
            });
        });
    }
}