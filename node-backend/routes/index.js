const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer storage
const memeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/memes/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const publish = multer({ storage: memeStorage });

const upload = multer({ dest: './public/images/uploads/' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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
    description: req.body.description,
    author: req.id,
    private: Boolean(req.body.private),
    draft: Boolean(req.body.draft),
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

router.get('/state', function(req, res, next) {
  res.send({userId: req.userId, username: req.username});
});

router.get('/login', async (req, res) => {
  res.send({ status: 'ok', message: 'Logged in successfully', userId: req.userId, username: req.username, loggedin: true });
});

module.exports = router;