const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    const db = req.db;
    const memes = db.get('memes');
    memes.find({author: req.id, draft: true}) // return all user properties, except the basic auth token
    // memes.find({author: req.query.id}) // return all user properties, except the basic auth token
        .then((docs) => {
            res.json(docs);
            console.log(docs)
        })
        .catch((e) => res.status(500).send())
});

module.exports = router;