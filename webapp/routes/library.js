// Chris Joakim, Microsoft, 2019/06/06

const express = require('express');
const router  = express.Router();
const util    = require('util');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

router.get('/', function(req, res) {
  var resp_obj = {};
  res.render('library', resp_obj);
});

router.get('/:bom_id', function(req, res) {
  var bom_id = '' + req.params.bom_id;
  console.log('bom_id: ' + bom_id);
  req.app.locals.dao.materialized_library_view(bom_id).then(function(result) {
    var lib_obj = result['result'][0];
    try {
      // TODO - refactor this common routine into a separate module; see bom.js#tooltip
      var now_ms = new Date().getTime();
      var created_epoch = lib_obj['created_epoch'];
      var version_epoch = lib_obj['version_epoch'];
      var created_age_ms = now_ms - created_epoch;
      var version_age_ms = now_ms - version_epoch;
      var curr_version   = lib_obj['version'];
      var version_count  = lib_obj['versions'].length;
      var version_date   = lib_obj['version_date'].split('T')[0];
      var created_date   = lib_obj['created_date'].split('T')[0];

      // recalculate ages based on current date/time
      var library_age_days  = Math.round(created_age_ms / MS_PER_DAY);
      var library_age_years = library_age_days / 365.25;
      var version_age_days  = Math.round(version_age_ms / MS_PER_DAY);
      lib_obj['library_age_days'] = library_age_days;
      lib_obj['version_age_days'] = version_age_days;

      lib_obj['versions_info'] = 
        util.format("Current: %s on %s (%s days), Total: %s, Created: %s (%s years)", 
        curr_version, version_date, version_age_days, version_count, created_date, library_age_years.toFixed(2));
      lib_obj['now'] = now_ms;
      console.log(lib_obj);
    }
    catch(e) {
      console.log(lib_obj);
      console.log(e);
    }
    res.render('library', lib_obj);
  });
});

router.get('/show_bom/:bom_id', function(req, res) {
  var bom_id = '' + req.params.bom_id;
  var sess = req.session;
  sess.curr_bom_id = bom_id;
  res.redirect('/bom');
});


module.exports = router;
