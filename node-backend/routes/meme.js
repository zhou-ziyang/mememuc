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

router.get('/:id/comments', function (req, res, next) {
    const db = req.db;
    const comments = db.get('comments');
    const {id} = req.params;
    comments.find({mid: id}, {sort: {date: -1}})
        .then((docs) => {
            res.json(docs)
        })
        .catch((e) => res.status(500).send())
});

router.get('/:mid/monthly_statistics_12', function (req, res, next) {
    const db = req.db;
    const comments = db.get('comments');
    const votes = db.get('votes');
    const {mid} = req.params;

    const date = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
        const start = new Date(date.getFullYear(), date.getMonth() - i, 1);
        const end = new Date(date.getFullYear(), date.getMonth() - i + 1, 0);
        months.push({start: start, end: end});
    }
    // console.log(months);
    const promises = months.map((month) => {
        console.log(month);
        return Promise.all([
            comments.count({mid: mid, date: {$gte: month.start, $lte: month.end}}),
            votes.count({mid: mid, type: 1, date: {$gte: month.start, $lte: month.end}}),
            votes.count({mid: mid, type: 0, date: {$gte: month.start, $lte: month.end}}),
            month
        ])
    });

    Promise.all(promises)
        .then((stats) => {
            let months = [], commentsCounts = [], likesCounts = [], dislikesCounts = [];
            stats.reverse().forEach((item, index) => {
                commentsCounts.push(item[0]);
                likesCounts.push(item[1]);
                dislikesCounts.push(item[2]);
                months.push(`${item[3].start.toLocaleDateString('en-US', {year: "numeric"})}/${item[3].start.toLocaleDateString('en-US', {month: "numeric"})}`);
            });

            res.json({
                "months": months,
                "comments": commentsCounts,
                "likes": likesCounts,
                "dislikes": dislikesCounts
            });
        })
        .catch((e) => res.status(500).send());
});

module.exports = router;