const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    const db = req.db;
    const drafts = db.get('drafts');
    drafts.find({author: req.id}) // return all user properties, except the basic auth token
        .then((docs) => {
            res.json(docs);
            console.log(docs)
        })
        .catch((e) => res.status(500).send())
});

router.post('/save', async (req, res) => {
    const db = req.db;
    const drafts = db.get('drafts');

    console.log(req.body);
    // Construct the meme document for MongoDB
    const draftDocument = {
        title: req.body.title,
        template: req.body.template,
        description: req.body.description,
        author: req.id,
        date: new Date(req.body.date),
        memeState: req.body.memeState
    };
    console.log(draftDocument);

    // Save meme to the database
    try {
        await drafts.insert([draftDocument])
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