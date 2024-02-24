const express = require('express');
const fs = require('fs');
const router = express.Router();

/* GET home page. */
router.get('/data/:id', function (req, res, next) {
    const db = req.db;
    const memes = db.get('memes');
    const {id} = req.params;
    memes.findOne({_id: id}) // return all user properties, except the basic auth token
        .then((docs) => {
            res.json(docs)
        })
        .catch((e) => res.status(500).send())
});

router.get('/:id/next', function (req, res, next) {
    const db = req.db;
    const memes = db.get('memes');
    const {id} = req.params;
    memes.find({draft: false, private: false})
        .then((all) => {
            const index = all.findIndex((meme) => meme._id == id);
            const next = all[index + 1] || all[0];
            res.json(next)
        })
        .catch((e) => res.status(500).send())
});

router.get('/:id/last', function (req, res, next) {
    const db = req.db;
    const memes = db.get('memes');
    const {id} = req.params;
    memes.find({draft: false, private: false})
        .then((all) => {
            const index = all.findIndex((meme) => meme._id == id);
            const last = all[index - 1] || all[all.length - 1];
            res.json(last)
        })
        .catch((e) => res.status(500).send())
});

router.get('/:id/random', function (req, res, next) {
    const db = req.db;
    const memes = db.get('memes');
    const {id} = req.params;
    memes.find({draft: false, private: false})
        .then((all) => {
            const index = all.findIndex((meme) => meme._id == id);
            const next = all[Math.floor(Math.random() * all.length)];
            if (next._id == id) {
                return res.json(all[(index + 1) % all.length])
            }
            res.json(next)
        })
        .catch((e) => res.status(500).send())
});

router.get('/:id', function (req, res, next) {
    const {id} = req.params;
    res.render('meme', {title: 'Express', id: id});
});

module.exports = router;