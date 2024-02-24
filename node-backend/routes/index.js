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
        date: new Date(req.body.date)
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

router.get('/auth', async (req, res) => {
    res.send({
        status: 'ok',
        message: 'Logged in successfully',
        userId: req.userId,
        username: req.username,
        loggedin: true
    });
});

// router.get('/meme')

module.exports = router;