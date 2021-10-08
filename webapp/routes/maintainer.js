// Chris Joakim, Microsoft, 2019/06/06

const express = require('express');
const router  = express.Router();

router.get('/', function(req, res) {
  var resp_obj = {};
  res.render('maintainer', resp_obj);
});

router.get('/:maint_id', function(req, res) {
  var maint_id = '' + req.params.maint_id;
  console.log('maint_id: ' + maint_id);
  req.app.locals.dao.materialized_maintainer_view(maint_id).then(function(result) {
    var data = result['resources'][0];
    console.log(data);
    res.render('maintainer', data);
  });
});

module.exports = router;
