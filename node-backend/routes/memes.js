const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    const db = req.db;
    const memes = db.get('memes');
    memes.find({},{ projection: {private: 0, draft: 0} }) // return all user properties, except the basic auth token
        .then((docs) => res.json(docs))
        .catch((e) => res.status(500).send())
});

module.exports = router;
