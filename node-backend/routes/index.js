const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const sharp = require('sharp');
// const fetch = require('node-fetch');
const http = require('http');
const https = require('https');

// Configure multer storage
const memeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images/memes/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const publish = multer({storage: memeStorage});

const upload = multer({dest: './public/images/uploads/'});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.post('/upload', upload.single('file'), async (req, res) => {
    res.send({file: req.file});
});

router.post('/publish', publish.single('file'), async (req, res) => {
    const db = req.db;
    const memes = db.get('memes');

    // Construct the meme document for MongoDB
    const memeDocument = {
        // _id: req.body._id,
        file: req.file.path,
        title: req.body.title,
        template: req.body.template,
        description: req.body.description,
        author: req.id,
        private: req.body.private === 'true',
        draft: req.body.draft === 'true',
        date: new Date(req.body.date),
        vote: [],
        comment: [],
    };
    console.log(memeDocument);

    // Save meme to the database
    try {
        await memes.insert([memeDocument])
            .then((docs) => {
                // docs contains the documents inserted with added **_id** fields
                // Inserted 3 documents into the document collection
            }).catch((err) => {
                // An error happened while inserting
            });
        res.send('ok');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred while saving meme to the database');
    }
});

router.get('/state', function (req, res, next) {
    res.send({userId: req.userId, username: req.username});
});

router.get('/login', async (req, res) => {
    res.send({
        status: 'ok',
        message: 'Logged in successfully',
        userId: req.userId,
        username: req.username,
        loggedin: true
    });
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

router.post('/generate-memes', async (req, res) => {
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

router.get('/meme')

module.exports = router;