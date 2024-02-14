const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/images/memes/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/upload', upload.single('file'), async (req, res) => {
  const db = req.db;
  // console.log(db);
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

module.exports = router;