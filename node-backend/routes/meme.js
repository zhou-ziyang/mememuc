const express = require('express');
const fs = require('fs');
const sharp = require("sharp");
const https = require("https");
const http = require("http");
const monk = require("monk");
const router = express.Router();

/* GET home page. */
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
    // const memes = db.get('memes');
    const {id} = req.params;
    filter_meme(req.query, db)
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
    filter_meme(req.query, db)
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
    filter_meme(req.query, db)
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

router.get('/:id/likes', function (req, res, next) {
    const db = req.db;
    const votes = db.get('votes');
    const {id} = req.params;
    votes.count({mid: id, type: 1})
        .then((count) => {
            res.json({count: count})
        })
        .catch((e) => res.status(500).send())
});

router.get('/:id/dislikes', function (req, res, next) {
    const db = req.db;
    const votes = db.get('votes');
    const {id} = req.params;
    votes.count({mid: id, type: 0})
        .then((count) => {
            res.json({count: count})
        })
        .catch((e) => res.status(500).send())
});

module.exports = router;