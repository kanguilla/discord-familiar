import { Command } from "./command";
import { Client, TextChannel, Message, Channel } from "discord.js";
import { userInfo } from "os";

export class WhoIs implements Command {

    private static INTRO = '657407960724537345';
    private static GENERAL = '657407955980910602';

    public static whoIs(args, message, client: Client) {

        var targetUser = client.users.find(user => {
            return user.username === args[0];
        });

        var introChannel = client.channels.get(WhoIs.INTRO) as TextChannel;

        var bookmark: Message;
        var allMessages: Message[] = [];

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

    public static say(args: Array<String>, client: Client) {

        var targetChannel = client.channels.find(channel => {
            return (channel as TextChannel).name === args[args.length - 1];
        });
        var textChannel: TextChannel = targetChannel as TextChannel;
        args.pop();
        textChannel.send(args.join(' '));
    }

    public static findMessage(channel:TextChannel, bookmark, author) {
        
        return new Promise((resolve, reject) => {
            channel.fetchMessages({ limit: 100, before: bookmark.id }).then(messages => {
                var foundMessage;
                messages.forEach((message:Message) => {
                    if(message.author.id === author.id){
                        foundMessage = message;
                    }
                });

                if(foundMessage){
                    resolve(foundMessage);
                } else {

                }
                

            });
        }).then(() => {
            return 
        });
    }
}