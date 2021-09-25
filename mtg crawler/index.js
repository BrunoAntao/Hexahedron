const MongoClient = require('mongodb').MongoClient;
const DBurl = "mongodb://localhost:27017/";

const fs = require('fs');
const request = require('request');
const got = require('got');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// Init

if (!fs.existsSync('./images')) fs.mkdirSync('./images');
if (!fs.existsSync('./mana')) fs.mkdirSync('./mana');

// Defenitions

let download = (uri, filename) => {

    request.head(uri, function (err, res, body) {

        request(uri).pipe(fs.createWriteStream(filename)).on('close', () => { });

    });

};

let query = {

    image: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cardImage',
    name: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_nameRow > div.value',
    mana: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_manaRow > div.value',
    cmc: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cmcRow > div.value',
    type: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_typeRow > div.value',
    text: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_textRow > div.value',
    pt: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ptRow > div.value',
    expansion: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_currentSetSymbol > a:nth-child(2)',
    rarity: '#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_rarityRow > div.value > span'

}

let cardCounter = 0;

let loadCard = async (card, length) => {

    let url = 'https://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=' + card.card;

    got(url).then((response) => {

        const page = new JSDOM(response.body);

        let fields = [];

        let colors;

        fields.push({

            label: 'Name',
            value: page.window.document.querySelector(query.name).innerHTML.trim()

        })

        let mana = page.window.document.querySelector(query.mana);

        if (mana) {

            colors = [];
            let manac = [];

            for (let i = 0; i < mana.children.length; i++) {

                let item = mana.children[i];

                let urlParams = new URLSearchParams(item.src);
                let name = urlParams.get('name');

                manac.push(name);

                switch (name) {

                    case 'W':
                    case 'U':
                    case 'B':
                    case 'R':
                    case 'G':

                        if (colors.indexOf(name) == -1) {

                            colors.push(name);

                        }

                        break;

                    default:

                        if (isNaN(name) && name != 'X') {

                            for (let i = 0; i < name.length; i++) {

                                let c = name[i];

                                if (colors.indexOf(c) == -1) {

                                    colors.push(c);

                                }

                            }

                        }

                        break;

                }

                if (!fs.existsSync('./mana/' + name + '.png')) {

                    let symbolUrl = new URL('/Handlers/Image.ashx?size=medium&name=' + name + '&type=symbol', url).href;

                    download(symbolUrl, './mana/' + name + '.png');

                }

            }

            fields.push({

                label: 'Mana cost',
                value: manac

            })

            fields.push({

                label: 'Converted mana cost',
                value: page.window.document.querySelector(query.cmc).innerHTML.trim()

            })

        }

        fields.push({

            label: 'Type',
            value: page.window.document.querySelector(query.type).innerHTML.trim()

        })

        let text = page.window.document.querySelector(query.text);

        if (text) {

            // let texts = [];

            // for (let i = 0; i < text.children.length; i++) {

            //     let box = text.children[i];

            //     texts.push(box.innerHTML);

            // }

            text.querySelectorAll('img').forEach(img => {

                let urlParams = new URLSearchParams(img.src);
                let name = urlParams.get('name');

                if (!fs.existsSync('./mana/' + name + '.png')) {

                    let symbolUrl = new URL('/Handlers/Image.ashx?size=medium&name=' + name + '&type=symbol', url).href;

                    download(symbolUrl, './mana/' + name + '.png');

                }

            })

            fields.push({

                label: 'Card text',
                value: text.innerHTML.trim()

            })

        }

        let pt = page.window.document.querySelector(query.pt);

        if (pt) {

            fields.push({

                label: 'Power / Toughness',
                value: pt.innerHTML.trim()

            })

        }

        fields.push({

            label: 'Expansion',
            value: page.window.document.querySelector(query.expansion).innerHTML.trim()

        })

        fields.push({

            label: 'Rarity',
            value: page.window.document.querySelector(query.rarity).innerHTML.trim()

        })

        let imageUrl = new URL(page.window.document.querySelector(query.image).src, url).href;

        let land = !colors;

        download(imageUrl, './images/' + card.card + '.png');

        MongoClient.connect(DBurl, function (err, db) {

            if (err) throw err;
            let dbo = db.db("db");

            dbo.collection("cards").updateOne({ _id: card._id },
                {

                    $set: {

                        loaded: true,
                        colors,
                        land,
                        fields

                    }

                }, function (err, result) {

                    if (err) throw err;
                    db.close();

                    cardCounter++;
                    console.log('%s %s\x1b[32m Done \x1b[0m', card.name.padEnd(50, ' '), (cardCounter.toString().padStart(3, ' ') + ' / ' + length));

                });

        });

    })

}

MongoClient.connect(DBurl, function (err, db) {

    if (err) throw err;
    let dbo = db.db("db");

    dbo.collection("cards").find({}).toArray(function (err, result) {

        if (err) throw err;
        db.close();

        result.forEach(card => {

            if(!card.loaded) {

                loadCard(card, result.length);

            }

        })

    });

});