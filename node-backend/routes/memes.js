const express = require('express');
const https = require("https");
const http = require("http");
const sharp = require("sharp");
// const { ObjectID } = require('mongodb');
const router = express.Router();
const monk = require('monk')

function filter_meme(query, db) {
    let {author, template, title, description, minDate, maxDate, minLikes, sortBy, n, order} = query;

    // parse n to an integer
    n = n ? parseInt(n) : Infinity;
    order = order ? order : "desc";
    sortBy = sortBy ? sortBy : "date";

    // define order
    order = order == 'asc' ? 1 : -1;

    // define the filter
    let filter = {draft: false, private: false};
    if (author) filter.author = author;
    if (template) filter.template = { $regex: new RegExp(template, 'i') };
    if (title) filter.title = { $regex: new RegExp(title, 'i') };
    if (description) filter.description = { $regex: new RegExp(description, 'i') };
    if (minDate) filter.date = {$gte: new Date(minDate)};
    if (maxDate) filter.date = {$lte: new Date(maxDate)};
    // if (minLikes) filter.likes = { $gte: parseInt(minLikes) };

    // define the sorting criteria
    const sort = {};
    sort[sortBy] = order;

    return db.get('memes').find(filter, {limit: n, sort: sort}) // return all user properties, except the basic auth token
}

/* GET users listing. */
router.get('/', function (req, res, next) {
    const db = req.db;
    let {from, to} = req.query;

    from = from ? parseInt(from) : 0;
    to = to ? parseInt(to) : Infinity;

    filter_meme(req.query, db)
        .then((docs) => {
            // map through the docs and add the url column
            const docsWithUrl = docs.map(doc => ({
                ...doc,
                url: `http://localhost:3000/meme/${doc._id}`,
            }));

            res.json(docsWithUrl.slice(from, to + 1));
        }) // slice the array from the "from" index to the "to" index
        .catch((e) => res.status(500).send())
});

router.get('/count', function (req, res, next) {
    const db = req.db;
    filter_meme(req.query, db)
        .then((docs) => res.json({count: docs.length}))
        .catch((e) => res.status(500).send())
});

function fetchImage(url) {
    const httpModule = url.startsWith('https:') ? https : http;

    return new Promise((resolve, reject) => {
        httpModule.get(url, (res) => {
            const data = [];

            res.on('data', (chunk) => {
                data.push(chunk);
            });

            res.on('end', () => {
                resolve(Buffer.concat(data));
            });

            res.on('error', reject);
        });
    });
}

router.post('/generate', async (req, res) => {
    const {imageUrl, textSets} = req.body;

    // Fetch the image from the URL
    const imageBuffer = await fetchImage(imageUrl);

    const {width, height} = await sharp(imageBuffer).metadata();

    const memeUrls = [];

    for (let i = 0; i < textSets.length; i++) {
        const texts = textSets[i];

        let memeBuffer = imageBuffer;

        for (let j = 0; j < texts.length; j++) {
            const {text, size, position, color} = texts[j];

            // Use sharp to overlay text onto the image
            memeBuffer = await sharp(memeBuffer)
                .composite([{
                    input: Buffer.from(`<svg width="${width}" height="${height}"><text x="${position.x}" y="${position.y}" fill="${color}" font-size="${size}">${text}</text></svg>`),
                    top: 0,
                    left: 0
                }])
                .toBuffer();
        }

        // Save the meme image to a location that can be accessed via a URL
        const memeUrl = `/images/memes-api/meme-${i}.png`;
        await sharp(memeBuffer).toFile(`./public${memeUrl}`);
        const urlOutput = `http://localhost:3001${memeUrl}`;
        memeUrls.push(urlOutput);
    }

    res.json({memeUrls});
});


module.exports = router;