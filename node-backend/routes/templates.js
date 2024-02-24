const express = require('express');
const fs = require("fs");
const path = require("path");
const router = express.Router();

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

router.get('/', function (req, res, next) {
    const db = req.db;
    const templates = db.get('templates');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    templates.find() // return all user properties, except the basic auth token
        .then((docs) => {
            const modifiedDocs = docs.map(doc => ({
                ...doc,
                url: `http://localhost:3001/images/templates/${doc.file}`
            }));
            res.json(modifiedDocs)
        })
        .catch((e) => res.status(500).send())
});

module.exports = router;
