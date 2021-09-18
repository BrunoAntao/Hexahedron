const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const url = "mongodb://localhost:27017/";
const phash = require('../hash-passphrase');

let logged = (req, res, next) => {

    if (!req.session.uid) {

        res.redirect('/login');

    } else {

        next();

    }

};

module.exports = (__dirname, app, instances) => {

    // Static ?

    app.get('/', (req, res) => {

        res.sendFile(__dirname + '/client/index.html');

    });

    app.get('/list', (req, res) => {

        res.sendFile(__dirname + '/client/list.html');

    });

    app.get('/card', (req, res) => {

        res.sendFile(__dirname + '/client/card.html');

    });

    app.get('/user', logged, (req, res) => {

        res.sendFile(__dirname + '/client/user.html');

    });

    app.get('/cube', (req, res) => {

        let { id } = req.query;

        if (id) {

            res.sendFile(__dirname + '/client/viewcube.html');

        } else {

            res.sendFile(__dirname + '/client/cube.html');

        }

    });

    app.get('/instance', (req, res) => {

        if (req.query.id) {

            res.sendFile(__dirname + '/client/instance.html');

        } else {

            res.status(404);
            res.send('Not found');

        }

    });

    // Logged

    app.get('/login', (req, res) => {

        if (req.session.uid) {

            res.redirect('/user');

        } else {

            res.sendFile(__dirname + '/client/login.html');

        }

    });

    app.post('/login', (req, res) => {

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

                            res.status(301);

                            res.json({

                                url: '/user'

                            });

                        } else {

                            res.status(301);

                            res.json({

                                url: '/login'

                            });

                        }

                    })

                } else {

                    res.status(301);

                    res.json({

                        url: '/login'

                    });

                }

            });

        });

    });

    app.get('/cubes', (req, res) => {

        let { id } = req.query;

        if (id) {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db("db");

                dbo.collection("lists").findOne({ _id: new ObjectId(id) }, function (err, result) {

                    if (err) throw err;
                    db.close();

                    res.json({ message: 'cube', name: result.name })

                });

            });

        } else {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                dbo.collection('lists').find({ owner: req.session.uid }).toArray(function (err, result) {

                    if (err) throw err;
                    db.close();

                    let lists = [];

                    result.sort(function (a, b) {

                        return new Date(a.created) - new Date(b.created);

                    });

                    result.forEach(list => {

                        lists.push({

                            id: list._id,
                            name: list.name,
                            created: list.created,

                        })

                    })

                    res.json({ message: 'lists', lists });

                })

            });

        }

    });

    app.post('/cube', (req, res) => {

        let { action, filter } = req.query;
        let { name, id } = req.body;

        if (action == 'save') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                let now = new Date();

                dbo.collection('lists').insertOne({

                    name: name,
                    owner: req.session.uid,
                    created: now,
                    updated: now

                }, function (err, result) {

                    if (err) throw err;

                    db.close();

                    MongoClient.connect(url, function (err, db) {

                        if (err) throw err;
                        let dbo = db.db("db");

                        dbo.collection("lists").findOne({ _id: result.insertedId }, function (err, result) {

                            if (err) throw err;
                            db.close();

                            res.json({ message: 'list added', data: { id: result._id, name: result.name } });

                        });

                    });

                });

            });

        } else if (action == 'remove') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                dbo.collection('lists').deleteOne({

                    _id: new ObjectId(id)

                }, function (err, result) {

                    if (err) throw err;

                    db.close();

                    res.json({ message: 'list removed' });

                });

            });

        } else if (action == 'check') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db("db");

                dbo.collection("lists-cards").find({ list: new ObjectId(id) }).toArray(function (err, result) {

                    if (err) throw err;
                    db.close();

                    if (result.length > 0) {

                        let uc = [];

                        result.forEach(c => {

                            uc.push(c.card);

                        })

                        MongoClient.connect(url, function (err, db) {

                            if (err) throw err;
                            let dbo = db.db("db");

                            dbo.collection("cards").find({ _id: { $in: uc } }).toArray(function (err, sresult) {

                                if (err) throw err;
                                db.close();

                                let cards = [];

                                sresult.forEach(card => {

                                    cards.push({

                                        id: card._id,
                                        name: card.name,
                                        color: card.colors,
                                        land: card.land

                                    })

                                })

                                res.json({ message: 'cards', cards })

                            })

                        });

                    }

                })

            });

        } else if (action == 'filter') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db("db");

                dbo.collection("lists-cards").find({ list: new ObjectId(id) }).toArray(function (err, result) {

                    if (err) throw err;
                    db.close();

                    if (result.length > 0) {

                        let uc = [];

                        result.forEach(c => {

                            uc.push(c.card);

                        })

                        let decode = {

                            'white': { _id: { $in: uc }, colors: ['W'] },
                            'blue': { _id: { $in: uc }, colors: ['U'] },
                            'black': { _id: { $in: uc }, colors: ['B'] },
                            'red': { _id: { $in: uc }, colors: ['R'] },
                            'green': { _id: { $in: uc }, colors: ['G'] },
                            'nonbasic-lands': { _id: { $in: uc }, colors: undefined },
                            'colorless-artifacts': { _id: { $in: uc }, colors: [] },
                            'multicolored': { _id: { $in: uc }, 'colors.1': { $exists: true } }

                        }

                        MongoClient.connect(url, function (err, db) {

                            if (err) throw err;
                            let dbo = db.db("db");

                            dbo.collection("cards").find(decode[filter]).toArray(function (err, sresult) {

                                if (err) throw err;
                                db.close();

                                let cards = [];

                                sresult.forEach(card => {

                                    let mana;
                                    let cmc;

                                    card.fields.forEach(field => {

                                        if (field.label == 'Mana cost') {

                                            mana = field.value;

                                        }

                                        if (field.label == 'Converted mana cost') {

                                            cmc = field.value;

                                        }

                                    })

                                    cards.push({

                                        id: card._id,
                                        name: card.name,
                                        mana,
                                        cmc,
                                        land: card.land

                                    })

                                })

                                res.json({ message: 'cards', cards })

                            })

                        });

                    }

                })

            });

        }

    });

    app.get('/search', (req, res) => {

        let { target, cube, name } = req.query;

        if (target == 'card') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db("db");

                dbo.collection("cards").aggregate([

                    {
                        "$lookup": {
                            from: "lists-cards",
                            let: { id: "$_id" },
                            pipeline: [

                                {

                                    "$match": {

                                        "$expr": {

                                            "$and":

                                                [
                                                    { "$eq": ["$card", "$$id"] },
                                                    { "$eq": ["$list", ObjectId(cube)] }
                                                ]

                                        }

                                    }

                                }

                            ],
                            as: 'trans'
                        }
                    },
                    {
                        "$match": {
                            name: { $regex: new RegExp('.*' + name + '.*', 'i') },
                            "trans.card": {
                                "$exists": false
                            }
                        }
                    }

                ]).toArray(function (err, result) {

                    if (err) throw err;
                    db.close();

                    let cards = [];

                    result.forEach(card => {

                        cards.push({

                            id: card._id,
                            name: card.name

                        })

                    })

                    res.json({ message: 'cards', cards })

                })

            });

        }

        if (target == 'cube') {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db("db");

                dbo.collection("lists-cards").find({ list: new ObjectId(cube) }).toArray(function (err, result) {

                    if (err) throw err;
                    db.close();

                    if (result.length > 0) {

                        let uc = [];

                        result.forEach(c => {

                            uc.push(c.card);

                        })

                        MongoClient.connect(url, function (err, db) {

                            if (err) throw err;
                            let dbo = db.db("db");

                            dbo.collection("cards").find({ _id: { $in: uc } }).toArray(function (err, sresult) {

                                if (err) throw err;
                                db.close();

                                let cards = [];

                                sresult.forEach(card => {

                                    cards.push({

                                        id: card._id,
                                        name: card.name

                                    })

                                })

                                res.json({ message: 'cards', cards })

                            })

                        });

                    }

                })

            });

        }

    });

    app.post('/card', (req, res) => {

        let { action, listid, id } = req.query;

        if (action == 'save' && listid && id) {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                dbo.collection('lists-cards').findOne({ list: new ObjectId(listid), card: new ObjectId(id) }, function (err, result) {

                    if (err) throw err;
                    db.close();

                    if (result) {

                        res.json({ error: 'card already in cube' });

                    } else {

                        MongoClient.connect(url, function (err, db) {

                            if (err) throw err;
                            let dbo = db.db('db');

                            dbo.collection('lists-cards').insertOne({

                                list: new ObjectId(listid),
                                card: new ObjectId(id)

                            }, function (err, result) {

                                if (err) throw err;

                                db.close();

                                res.json({ message: 'card added to cube' });

                            });

                        });

                    }

                });

            });

        } else if (action == 'remove' && listid && id) {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                dbo.collection('lists-cards').deleteOne({ list: new ObjectId(listid), card: new ObjectId(id) }, function (err, result) {

                    if (err) throw err;
                    db.close();

                    res.json({ message: 'card removed from cube' });

                });

            });

        } else if (action == 'check' && listid && id) {

            MongoClient.connect(url, function (err, db) {

                if (err) throw err;
                let dbo = db.db('db');

                dbo.collection('lists-cards').findOne({ list: new ObjectId(listid), card: new ObjectId(id) }, function (err, result) {

                    if (err) throw err;
                    db.close();

                    if (result) {

                        MongoClient.connect(url, function (err, db) {

                            if (err) throw err;
                            let dbo = db.db('db');

                            dbo.collection('cards').findOne({ _id: new ObjectId(id) }, function (err, result) {

                                if (err) throw err;
                                db.close();

                                res.json({
                                    message: 'card', card: {

                                        id: result._id,
                                        cid: result.card,
                                        name: result.name,
                                        fields: result.fields


                                    }
                                })

                            });

                        })

                    } else {

                        res.json({ message: 'no such card on cube' });

                    }

                });

            });

        }

    });

}