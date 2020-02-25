import { Command } from "./command";
import { MongoClient } from "mongodb";

export class Spin implements Command {

    private collection;

    public static createInstance() {
        return new Promise((resolve, reject) => {
            var url = 'mongodb://localhost:27017';
            MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                if (err)reject(err);
                console.log("Spin instance created.");
                var newSpin = new Spin();
                newSpin.collection = client.db("tofriends").collection('spinUsers');
                resolve(newSpin);
            });
        });
    }

    public addSpinData(data: any) {
        if (!this.collection)return;
        return new Promise((resolve, reject) => {
            this.collection.insertOne(data, (err, res) => {
                if (err) reject(err);
                console.log("Inserted 1 document: " + data.toString());
                resolve();
            });
        });
    }

}