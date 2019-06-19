// Program to Load the "materialized views" into the CosmosDB/Graph DB
// via the CosmosDB w/SQL API.
// Chris Joakim, Microsoft, 2019/06/06
//
// node load_materialized_views.js dev views 50 > tmp/load_materialized_views.txt

const fs = require('fs');
const util = require('util');

const CosmosDbDao = require('./webapp/dao/cosmosdb_dao').CosmosDbDao;
const FSUtil      = require('./lib/fsu').FSUtil;
const Wrangler    = require('./lib/wrangle').Wrangler;

// two data files produced in the wrangling process
const agg_libraries = require('./data/aggregated_libraries.json');
const maintainers   = require('./data/maintainers.json');

// command-line args
const db_name   = process.argv[2]; 
const coll_name = process.argv[3];
const sleep_ms  = Number(process.argv[4]);
console.log('db_name:   ' + db_name);
console.log('coll_name: ' + coll_name);
console.log('sleep_ms:  ' + sleep_ms);

//var agg_library_keys = Object.keys(agg_libraries);
var maintainer_keys  = Object.keys(maintainers);
// console.log(util.format("agg_libraries read; %s objects", agg_library_keys.length));
// console.log(util.format("maintainers read;   %s objects", maintainer_keys.length));

// Put the view data into an array for subsequent load processing
var view_data_array = [];
var fsu = new FSUtil();
var wrangler = new Wrangler();

for (var i = 0; i < agg_libraries.length; i++) {
    var mv  = agg_libraries[i];
    var name = mv['name'];
    mv['pk'] = wrangler.scrub_value(name);
    mv['key'] = name;
    mv['doctype'] = 'library';
    view_data_array.push(mv);
}
for (var i = 0; i < maintainer_keys.length; i++) {
    var key = maintainer_keys[i];
    var mv  = maintainers[key];
    delete mv['id'];
    mv['pk'] = wrangler.scrub_value(key);
    mv['key'] = key;
    mv['doctype'] = 'maintainer';
    view_data_array.push(mv);
}
console.log(util.format("view_data_array; %s objects", view_data_array.length));
fsu.write_json_file('data/view_data_array.json', view_data_array);

console.log('Creating CosmosDbDao');
var dao = new CosmosDbDao();

var load_index = -1;
var do_db_load = true;

load_next_row();  // start the load, this is a recursive function

finish();

function load_next_row() {
    load_index = load_index + 1;
    if (load_index < view_data_array.length) {
        var mv_doc = view_data_array[load_index];
        console.log('---');
        console.log('load_next_row; idx: ' + load_index); 
        console.log(JSON.stringify(mv_doc));

        if (do_db_load) {
            dao.sql_create_doc(db_name, coll_name, mv_doc).then(function(result) {
                console.log(result['body']);
                console.log(result['headers']);
                setTimeout(load_next_row, sleep_ms);
            });
        }
        else {
            setTimeout(load_next_row, sleep_ms);
        }
    }
    else {
        finish();
    }
}

function finish() {
    console.log("Finished");
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}
