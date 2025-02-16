const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  const db = req.db;
  const users = db.get('users');
  users.find({username: req.username},{ projection: {basicauthtoken: 0} }) // return all user properties, except the basic auth token
      .then((docs) => res.json(docs))
      .catch((e) => res.status(500).send())
});

router.get('/:id', function(req, res, next) {
  const db = req.db;
  const users = db.get('users');
  users.findOne({_id: req.params.id})
      .then((docs) => res.json(docs))
      .catch((e) => res.status(500).send())
});

module.exports = router;
