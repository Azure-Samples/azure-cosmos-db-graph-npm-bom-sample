// Chris Joakim, Microsoft, 2019/06/06

const express = require('express');
const router  = express.Router();
const request = require('request');
const events  = require('events');
const util    = require('util');
const fs      = require('fs');
const os      = require('os');

const D3CsvUtil = require('../util/d3_csv_util').D3CsvUtil;

const MS_PER_DAY = 1000 * 60 * 60 * 24;


router.get('/', function(req, res) {
  var sess = req.session;
  var resp_obj = {};
  if (sess.curr_bom_id) {
    resp_obj['bom_id'] = sess.curr_bom_id;
  }
  else {
    resp_obj['bom_id'] = 'tedious';  // 'tcx-js';
  }
  res.render('bom', resp_obj);
});

router.post('/', function(req, res) {
  var bom_id = req.body.bom_id;
  console.log('bom_router post / ' + bom_id);
  var sess = req.session;
  sess.curr_bom_id = bom_id;
  var resp_obj = {};
  resp_obj['bom_id'] = bom_id;
  res.render('bom', resp_obj);
});

router.get('/csv', function(req, res) {
  var sess = req.session;
  console.log('sess: ' + JSON.stringify(sess));

  if (sess.curr_bom_id) {
    var bom_id = sess.curr_bom_id.replace(/\//g, '|').trim(); // convert @azure/cosmos to @azure|cosmos
    var d3_util = new D3CsvUtil();
    console.log('bom_router get /csv ' + bom_id);
    req.app.locals.dao.gremlin_get_dep_graph(bom_id).then(function(result) {
      //console.log(result);
      var csv_lines = d3_util.gremlin_dep_graph_to_d3_csv(result);
      //console.log(csv_lines);
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv_lines);
    });
  }
  else {
    res.set('Content-Type', 'text/csv');
    res.status(200).send('');
  }
});

// curl -v "http://localhost:3000/bom/tooltip/tedious" | jq
// curl -v "http://localhost:3000/bom/tooltip/@azure|amqp-common" | jq
router.get('/tooltip/:bom_id', function(req, res) {
  var bom_id = '' + req.params.bom_id.replace("/", "|");
  console.log('bom_id: ' + bom_id);

  req.app.locals.dao.materialized_library_view(bom_id).then(function(result) {
    var lib_obj = result['result'][0];
    try {
      // TODO - refactor this common routine into a separate module; see library.js#get
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

      lib_obj['tooltip_info'] = 
        util.format("%s, v%s on %s (%s days)", bom_id, curr_version, version_date, version_age_days);
      lib_obj['now'] = now_ms;
      console.log(lib_obj);
    }
    catch(e) {
      console.log(lib_obj);
      console.log(e);
    }
    res.json(lib_obj);
  });
});

module.exports = router;
