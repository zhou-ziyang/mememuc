const express = require('express');
const fs = require("fs");
const path = require("path");
const router = express.Router();

// router.use(cors());

/* GET users listing. */
// router.get('/', function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     const dir = path.join(__dirname, '../public/images/templates')
//     const EXTENSION = ['.jpg', '.png', '.gif'];
//     fs.readdir(dir, function (err, files) {
//         const image_files = files.filter(el => EXTENSION.includes(path.extname(el)))
//         res.json(image_files)
//     })
// });

router.get('/', function(req, res, next) {
    const db = req.db;
    const memes = db.get('templates');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    memes.find({},{ projection: {private: 0, draft: 0} }) // return all user properties, except the basic auth token
        .then((docs) => res.json(docs))
        .catch((e) => res.status(500).send())
});

module.exports = router;
