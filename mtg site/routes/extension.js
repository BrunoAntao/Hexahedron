const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const phash = require('../hash-passphrase.js');

let exlogged = (req, res, next) => {

    if (!req.session.uid) {

        res.json({ redirect: true, page: 'login' });

    } else {

        next();

    }

};

module.exports = (__dirname, app) => {

    app.post('/exauth', exlogged, (req, res) => {

        res.json({ logged: true });

    });

    app.post('/exlogin', (req, res) => {

        let { username, password } = req.body;

        console.log(req.session.id);

        MongoClient.connect(url, function (err, db) {

            if (err) throw err;
            let dbo = db.db("db");

            dbo.collection("users").findOne({ username }, function (err, result) {

                if (err) throw err;
                db.close();

                if (result) {

                    phash.verify(result.password, password).then((ver) => {

                        if (ver) {

                            req.session.uid = result._id;

                            res.json({ logged: true });

                        } else {

                            res.json({ logged: false });

                        }

                    })

                } else {

                    res.json({ logged: false });

                }

            });

        });

    });

    app.get('/excard', exlogged, (req, res) => {

        MongoClient.connect(url, function (err, db) {

            if (err) throw err;
            let dbo = db.db('db');

            dbo.collection('cards').find({}).toArray(function (err, result) {

                if (err) throw err;
                db.close();

                let cards = [];

                result.forEach(card => {

                    cards.push({

                        id: card.card,
                        name: card.name

                    })

                })

                res.json({ message: 'cards', cards });

            })

        });
    });

    app.post('/excard', exlogged, (req, res) => {

        let { action } = req.query;
        let { id, name } = req.body;

        if (action == 'save') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                dbo.collection('cards').findOne({ card: id }, function (err, result) {

                    if (err) throw err;
                    db.close();

                    if (result) {

                    } else {

                        MongoClient.connect(url, function (err, db) {

                            if (err) throw err;
                            let dbo = db.db('db');

                            dbo.collection('cards').insertOne({

                                user: req.session.uid,
                                card: id,
                                name: name,
                                loaded: false

                            }, function (err, result) {

                                if (err) throw err;

                                console.log('card "' + name + '" registered');

                                db.close();

                                res.json({ message: 'card registered' });

                            });

                        });

                    }

                });

            });

        } if (action == 'check') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                dbo.collection('cards').findOne({ card: id }, function (err, cresult) {

                    if (err) throw err;
                    db.close();

                    if (cresult) {

                        res.json({ exists: true });

                    } else {

                        res.json({ exists: false });

                    }

                });

            });

        }

    });

}