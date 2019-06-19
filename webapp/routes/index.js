// Chris Joakim, Microsoft, 2019/06/06

const express = require('express');
const router  = express.Router();

router.get('/', function(req, res) {
  var resp_obj = {};
  resp_obj['current_date'] = new Date().toString();
  resp_obj['uuid'] = req.app.locals.some_uuid;
  resp_obj['pid'] = req.app.locals.pid;
  res.render('index', resp_obj);
});

module.exports = router;
