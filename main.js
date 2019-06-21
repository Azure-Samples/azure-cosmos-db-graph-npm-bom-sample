"use strict";

// Main batch program for this codebase, for CLI invocation.
// Chris Joakim, Microsoft, 2019/06/21

const fs = require('fs');
const util = require('util');
console.log('process.argv: ' + JSON.stringify(process.argv) + '  length: ' + process.argv.length);

const Constants   = require('./lib/constants');
const FSUtil      = require('./lib/fsu').FSUtil;
const NpmSpider   = require('./lib/npm').NpmSpider;
const Wrangler    = require('./lib/wrangle').Wrangler;
const CosmosDbDao = require('./webapp/dao/cosmosdb_dao').CosmosDbDao;

if (process.argv.length < 3) {
    console.log('Invalid program args; please specify a runtime function as follows:');
    console.log('node main.js seed2json');
    console.log('node main.js spider_npm 10 > tmp/spider_npm.txt');
    console.log('node main.js aggregate_lib_files');
    console.log('node main.js create_gremlin_load_file');
    console.log('node main.js query_vertex tedious');
    console.log('node main.js query_vertex MAINT-cjoakim');
    console.log('node main.js query_dep_graph tedious');
    console.log('node main.js query_library_view tedious');
    console.log('node main.js query_maint_view dougwilson');
    console.log('');
    process.exit();
}
else {
    var cli_function = process.argv[2];

    switch(cli_function) {

        case 'seed2json':
            var fsu = new FSUtil();
            var lines = fsu.read_text_file('seed.txt').split("\n").sort();
            fsu.write_json_file(Constants.SEED_LIBRARIES_FILE, lines);
            break;

        case 'spider_npm':
            var iterations = Number(process.argv[3]);
            var spider = new NpmSpider(iterations);
            spider.execute()
            break;

        case 'aggregate_lib_files':
            new Wrangler().aggregate_lib_files();
            break;

        case 'create_gremlin_load_file':
            new Wrangler().create_gremlin_load_file();
            break;

        case 'query_vertex':
                var lib_id = process.argv[3];
                var dao = new CosmosDbDao();
                var fsu = new FSUtil();
                dao.gremlin_get_vertex(lib_id).then(function(result) {
                    var outfile = util.format("tmp/gremlin_get_vertex_%s.json", lib_id);
                    fsu.write_json_file(outfile, result);
                    fsu.write_json_file('tmp/query_vertex.json', result);
                });
                break;

        case 'query_dep_graph':
                var lib_id = process.argv[3];
                var dao = new CosmosDbDao();
                var fsu = new FSUtil();
                dao.gremlin_get_dep_graph(lib_id).then(function(result) {
                    var outfile = util.format("tmp/gremlin_get_dep_graph_%s.json", lib_id);
                    fsu.write_json_file(outfile, result);
                });
                break;

        case 'query_library_view':
            var lib_id = process.argv[3];
            var dao = new CosmosDbDao();
            var fsu = new FSUtil();
            dao.materialized_library_view(lib_id).then(function(result) {
                var outfile = util.format("tmp/lib_view_%s.json", lib_id);
                fsu.write_json_file(outfile, result);
            });
            break;

        case 'query_maint_view':
            var maint_id = process.argv[3];
            var dao = new CosmosDbDao();
            var fsu = new FSUtil();
            dao.materialized_maintainer_view(maint_id).then(function(result) {
                var outfile = util.format("tmp/maint_view_%s.json", maint_id);
                fsu.write_json_file(outfile, result);
            });
            break;

        case 'query_lib_bom':
                var lib_id = process.argv[3];
                var dao = new CosmosDbDao();
                var fsu = new FSUtil();
                dao.gremlin_get_bom(lib_id).then(function(result) {
                    var outfile = util.format("tmp/gremlin_get_bom_%s.json", lib_id);
                    fsu.write_json_file(outfile, result);
                    fsu.write_json_file('tmp/latest_query.json', result);
                });
                break;

        default:
            console.log('error, unknown cli function: ' + cli_function);
    }
    setTimeout(finish, 2000);
}


function finish() {
    var prompt_to_exit = false;
    if (prompt_to_exit) {
        console.log("hit any key to exit");
        process.stdin.resume();
        process.stdin.on('data', process.exit.bind(process, 0));
    }
    else {
        process.exit();
    }
}
