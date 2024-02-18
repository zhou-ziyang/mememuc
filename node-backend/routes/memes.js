const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    const db = req.db;
    const memes = db.get('memes');
    memes.find({draft: false, private: false}, {
        projection: {
            private: 0,
            draft: 0
        }
    }) // return all user properties, except the basic auth token
        .then((docs) => res.json(docs))
        .catch((e) => res.status(500).send())
});

router.post('/vote_up', function (req, res, next) {
    const db = req.db;
    const votes = db.get('votes');
    votes.findOneAndUpdate({mid: req.body.mid, uid: req.id}, {$set: {type: 1}}, {upsert: true})
        .then((doc) => res.json(doc))
        .catch((e) => res.status(500).send())
});

router.post('/vote_down', function (req, res, next) {
    const db = req.db;
    const votes = db.get('votes');
    votes.findOneAndUpdate({mid: req.body.mid, uid: req.id}, {$set: {type: 0}}, {upsert: true})
        .then((doc) => res.json(doc))
        .catch((e) => res.status(500).send())
});

router.get('/:mid/vote', function (req, res, next) {
    const db = req.db;
    const votes = db.get('votes');
    votes.findOne({mid: req.params.mid, uid: req.id})
        .then((docs) => res.json(docs))
        .catch((e) => res.status(500).send())
});

module.exports = router;