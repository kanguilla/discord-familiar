"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Spin {
    static createInstance() {
        return new Promise((resolve, reject) => {
            var url = 'mongodb://localhost:27017';
            mongodb_1.MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {
                if (err)
                    throw err;
                console.log("Spin instance created.");
                const db = client.db("tofriends");
                db.listCollections().toArray().then((docs) => {
                    console.log('Available collections:');
                    docs.forEach((doc, idx, array) => { console.log(doc.name); });
                }).catch((err) => {
                    console.log(err);
                }).finally(() => {
                    client.close();
                });
            });
        });
    }
    addSpinData(data) {
    }
}
exports.Spin = Spin;
