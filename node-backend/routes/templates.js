const express = require('express');
const fs = require("fs");
const path = require("path");
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    const dir = path.join(__dirname, '../public/images/templates')
    const EXTENSION = ['.jpg', '.png', '.gif'];
    fs.readdir(dir, function (err, files) {
        const image_files = files.filter(el => EXTENSION.includes(path.extname(el)))
        res.json(image_files)
    })
});

module.exports = router;
