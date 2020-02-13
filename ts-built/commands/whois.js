"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class WhoIs {
    static whoIs(args, message, client) {
        var targetUser = client.users.find(user => {
            return user.username === args[0];
        });
        var introChannel = client.channels.get(WhoIs.INTRO);
        var bookmark;
        var allMessages = [];
        // introChannel.fetchMessages({ limit: 100 }).then(messages => {
        //     this.findMessage()
        //     messages.forEach(m => allMessages.push(m));
        //     bookmark = allMessages[allMessages.length - 1];
        //     client.fetchMessages({ limit: 100, before: bookmark.id }).then(messages => {
        //             messages.forEach(m => allMessages.push(m));
        //             bookmark = allMessages[allMessages.length - 1];
        //     });
        // });
    }
    static say(args, client) {
        var targetChannel = client.channels.find(channel => {
            return channel.name === args[args.length - 1];
        });
        var textChannel = targetChannel;
        args.pop();
        textChannel.send(args.join(' '));
    }
    static findMessage(channel, bookmark, author) {
        return new Promise((resolve, reject) => {
            channel.fetchMessages({ limit: 100, before: bookmark.id }).then(messages => {
                var foundMessage;
                messages.forEach((message) => {
                    if (message.author.id === author.id) {
                        foundMessage = message;
                    }
                });
                if (foundMessage) {
                    resolve(foundMessage);
                }
                else {
                }
            });
        }).then(() => {
            return;
        });
    }
}
exports.WhoIs = WhoIs;
WhoIs.INTRO = '657407960724537345';
WhoIs.GENERAL = '657407955980910602';
