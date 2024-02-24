const express = require('express');
const router = express.Router();

/* GET users listing. */
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

router.post('/comment', function (req, res, next) {
  const db = req.db;
  const comments = db.get('comments');
  console.log(req.id);
  comments.insert({mid: req.body.mid, uid: req.id, content: req.body.content, date: new Date()})
      .then((doc) => res.json(doc))
      .catch((e) => res.status(500).send())
});

router.get('/:mid/check_vote', function (req, res, next) {
  const db = req.db;
  const votes = db.get('votes');
  // console.log(req.id);
  votes.findOne({mid: req.params.mid, uid: req.id})
      .then((docs) => res.json(docs))
      .catch((e) => res.status(500).send())
});

module.exports = router;
