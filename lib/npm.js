'use strict';

var fs     = require('fs');
var events = require('events');
var util   = require('util');

const execSync = require('child_process').execSync;

const Constants = require('./constants');
const FSUtil    = require('./fsu').FSUtil;

// Chris Joakim, Microsoft, 2019/06/06

// ====================================================================

class NpmSpider extends events.EventEmitter {

    constructor(iterations) {
        super();
        this.iterations = iterations;
        this.fsu = new FSUtil();
        this.libs_dir = util.format("%s/data/libs", process.cwd());
    }

    execute() {
        console.log('execute; ' + this.iterations);
        for (var i = 0; i < this.iterations; i++) {
            console.log("\n=== ITERATION: " + i);
            this.spider_libs(i);
        }
    }

    spider_libs(iteration) {
        var all_libs = [];
        var parsed_files = {};

        if (iteration < 1) {
            all_libs = this.fsu.read_json_file(Constants.SEED_LIBRARIES_FILE);
            for (var i = 0; i < all_libs.length; i++) {
                this.get_npm_view(all_libs[i]);
            }
        }
        else {
            all_libs = this.fsu.read_json_file(Constants.CURRENT_LIBRARIES_FILE);
            parsed_files = this.fsu.read_json_file(Constants.LIBRARIES_PARSED_FILE);
        }
        var all_libs_set = new Set(all_libs);

        console.log('spider_libs - all_libs_set size: ' + all_libs_set.size);
        var files = fs.readdirSync(this.libs_dir);

        for (var i = 0; i < files.length; i++) {
            var filename = files[i];
            if (filename.endsWith('.json')) {
                var lib_info_file = util.format("%s/%s", this.libs_dir, filename);
                if (parsed_files[lib_info_file]) {
                    console.log('spider_libs - already parsed: ' + lib_info_file);
                }
                else {
                    console.log('spider_libs - parsing file: ' + lib_info_file);
                    var lib_info = this.fsu.read_json_file(lib_info_file);
                    this.get_dependencies(lib_info, 'dependencies', all_libs_set);
                    //this.get_dependencies(lib_info, 'devDependencies', all_libs_set);
                    parsed_files[lib_info_file] = true;
                }
            }
        }
        this.fsu.write_json_file(Constants.CURRENT_LIBRARIES_FILE, Array.from(all_libs_set));
        this.fsu.write_json_file(Constants.LIBRARIES_PARSED_FILE, parsed_files);
    }

    get_dependencies(lib_info, key, all_libs_set) {
        if (lib_info[key]) {
            var dep_names = Object.keys(lib_info[key]);
            for (var d = 0; d < dep_names.length; d++) {
                var lib = dep_names[d];
                if (all_libs_set.has(lib)) {
                    console.log('spider_libs - present: ' + lib);
                }
                else {
                    console.log('spider_libs - new: ' + lib);
                    this.get_npm_view(lib);
                    all_libs_set.add(lib);
                }
            }
        }
    }

    get_npm_view(lib) {
        try {
            var norm_lib = lib.replace('/','-');
            var command = util.format("npm view %s -json > data/libs/%s.json", lib, norm_lib);
            console.log('get_npm_view command: ' + command);
            var result = execSync(command);
        }
        catch(error) {
            console.error("ERROR on lib: " + lib);
            console.error(error);
        }
        return;
    }
}

module.exports.NpmSpider = NpmSpider;
