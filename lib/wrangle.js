'use strict';

var fs     = require('fs');
var events = require('events');
var util   = require('util');

const Constants = require('./constants');
const FSUtil    = require('./fsu').FSUtil;

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const NOW_MS     = new Date().getTime();


// Utility class for Wrangling the captured npm data.
// Chris Joakim, Microsoft, 2019/06/15

class Wrangler extends events.EventEmitter {

    constructor() {
        super();
        this.fsu = new FSUtil();
        this.libs_dir = util.format("%s/data/libs", process.cwd());
    }
	
	aggregate_lib_files() {
		console.log('aggregate_lib_files...');
		var agg_list = [];
		
        var files = this.fsu.read_directory_entries(this.libs_dir);

        for (var i = 0; i < files.length; i++) {
            var filename = files[i];
            if (filename.endsWith('.json')) {
				var lib_info_file = util.format("%s/%s", this.libs_dir, filename);
				console.log(util.format("file: %s %s", i, lib_info_file));
                try {
                    // Take most but not all of the npm data
                    var lib_info = this.fsu.read_json_file(lib_info_file);
                    var obj = {};
                    obj['name'] = lib_info['name'];
                    obj['desc'] = '';
                    obj['keywords'] = [];
                    obj['dependencies'] = {};
                    obj['devDependencies'] = {};
                    obj['author'] = '';
                    obj['users'] = {};
                    obj['contributors'] = [];
                    obj['maintainers'] = [];
                    obj['version'] = '';
                    obj['versions'] = [];
                    obj['time'] = {};
                    obj['homepage'] = '';

                    // augmented attributes
                    obj['user_count'] = 0;
                    obj['dependencies_count'] = 0;
                    obj['maintainers_count'] = 1;
                    obj['versions_count'] = 1;
                    obj['usage_count'] = 0;
                    obj['used_in'] = [];
                    obj['version_date'] = '?';
                    obj['created_date'] = '?';
                    obj['created_epoch'] = -1;
                    obj['version_epoch'] = -1;
                    obj['library_age_days'] = -1;
                    obj['version_age_days'] = -1;

                    if (lib_info['description']) {
                        obj['desc'] = lib_info['description'];
                    }
                    if (lib_info['keywords']) {
                        obj['keywords'] = lib_info['keywords'];
                    }
                    if (lib_info['dependencies']) {
                        obj['dependencies'] = lib_info['dependencies'];
                    }
                    if (lib_info['devDependencies']) {
                        obj['devDependencies'] = lib_info['devDependencies'];
                    }
                    if (lib_info['author']) {
                        obj['author'] = lib_info['author'];
                    }
                    if (lib_info['users']) {
                        obj['users'] = lib_info['users'];
                    }
                    if (lib_info['contributors']) {
                        obj['contributors'] = lib_info['contributors'];
                    }
                    if (lib_info['maintainers']) {
                        obj['maintainers'] = lib_info['maintainers'];
                    }
                    if (lib_info['version']) {
                        obj['version'] = lib_info['version'];
                    }
                    if (lib_info['versions']) {
                        obj['versions'] = lib_info['versions'];
                    }
                    if (lib_info['time']) {
                        obj['time'] = lib_info['time'];
                    }
                    if (lib_info['homepage']) {
                        obj['homepage'] = lib_info['homepage'];
                    }
                    agg_list.push(obj);
                }
                catch(e) {
                    console.log('aggregate_lib_files - Exception on file: ' + lib_info_file);
                    console.log(e);
                }
			}
        }
        
        this.augment_libraries_with_where_used(agg_list);
        this.augment_libraries_with_simple_counts(agg_list);
        this.augment_libraries_with_usage_counts(agg_list);
        this.augment_libraries_with_age(agg_list);

        this.fsu.write_json_file(Constants.AGGREGATED_LIBRARIES_FILE, agg_list);
    }

    augment_libraries_with_simple_counts(agg_list) {
        for (var i = 0; i < agg_list.length; i++) {
            var lib_obj = agg_list[i];
            // lib_obj['user_count'] = 0;
            // lib_obj['dependencies_count'] = 0;
            // lib_obj['maintainers_count'] = 1;
            // lib_obj['versions_count'] = 1;

            if (lib_obj['users']) {
                lib_obj['user_count'] = Object.keys(lib_obj['users']).length;
            }
            if (lib_obj['dependencies']) {
                lib_obj['dependencies_count'] = Object.keys(lib_obj['dependencies']).length;
            }
            if (lib_obj['maintainers']) {
                lib_obj['maintainers_count'] = lib_obj['maintainers'].length;
            }
            if (lib_obj['versions']) {
                lib_obj['versions_count'] = lib_obj['versions'].length;
            }
        }
    }

    augment_libraries_with_usage_counts(agg_list) {
        var usage_counter = {};

        // First pass, aggregate the counts
        for (var i = 0; i < agg_list.length; i++) {
            var lib_obj = agg_list[i];
            var lib_name = lib_obj['name'];
            this.increment_counter(usage_counter, lib_name);

            var dependencies_dict = lib_obj['dependencies'];
            var dep_names = (Object.keys(dependencies_dict));
            for (var d = 0; d < dep_names.length; d++) {
                var dep_name = dep_names[d];
                this.increment_counter(usage_counter, dep_name);
            }
        }

        // Second pass, set the counts
        for (var i = 0; i < agg_list.length; i++) {
            var lib_obj = agg_list[i];
            var lib_name = lib_obj['name'];
            lib_obj['usage_count'] = usage_counter[lib_name];
        }
        //this.summarize_counter(usage_counter);
        this.fsu.write_json_file(Constants.AGGREGATED_USAGE_FILE, usage_counter);
    }

    augment_libraries_with_age(agg_list) {
        for (var i = 0; i < agg_list.length; i++) {
            var lib_obj = agg_list[i];
            // lib_obj['version_date'] = '?';
            // lib_obj['created_date'] = '?';
            // lib_obj['created_epoch'] = -1;
            // lib_obj['version_epoch'] = -1;
            // lib_obj['library_age_days'] = -1;
            // lib_obj['version_age_days'] = -1;
            try {
                var curr_version = lib_obj['version'];
                var created_date = lib_obj['time']['created'];
                var version_date = lib_obj['time'][curr_version];
                lib_obj['created_date'] = created_date;
                lib_obj['version_date'] = version_date;

                var created_epoch = Date.parse(created_date);
                var version_epoch = Date.parse(version_date);
                lib_obj['created_epoch'] = created_epoch;
                lib_obj['version_epoch'] = version_epoch;

                var created_age_ms = NOW_MS - created_epoch;
                var version_age_ms = NOW_MS - version_epoch;
                lib_obj['library_age_days'] = Math.round(created_age_ms / MS_PER_DAY);
                lib_obj['version_age_days'] = Math.round(version_age_ms / MS_PER_DAY);
            }
            catch(e) {
                console.log(e);
            }
        }
    }

    augment_libraries_with_where_used(agg_list) {
        var usage_dict = {};
        // First pass, aggregate the usage
        for (var i = 0; i < agg_list.length; i++) {
            var lib_obj = agg_list[i];
            var lib_name = lib_obj['name'];
            var dependencies_dict = lib_obj['dependencies'];
            var dep_names = (Object.keys(dependencies_dict));
            for (var d = 0; d < dep_names.length; d++) {
                var dep_name = dep_names[d];
                this.increment_usage(usage_dict, dep_name, lib_name);
            }
        }
        // Second pass, set the used_in attribute
        for (var i = 0; i < agg_list.length; i++) {
            var lib_obj = agg_list[i];
            var lib_name = lib_obj['name'];
            if (usage_dict[lib_name]) {
                lib_obj['used_in'] = usage_dict[lib_name];
            }
        }
    }

    increment_counter(counter, key) {
        if (key in counter) {
            var value = counter[key];
            counter[key] = Number(value + 1);
        }
        else {
            counter[key] = Number(1);
        }
    }

    increment_usage(usage_dict, dep_name, used_in_lib_name) {
        if (dep_name in usage_dict) {
            //var curr_value = usage_dict[dep_name];
            usage_dict[dep_name].push(used_in_lib_name);
        }
        else {
            usage_dict[dep_name] = [ used_in_lib_name ];
        }
    }

    summarize_counter(counter) {
        var sum = 0;
        var keys = (Object.keys(counter));
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var count = counter[key];
            sum = sum + count;
            console.log('counter - sum: ' + sum + ' after ' + key + ' ' + count);
        }
    }
    
    create_gremlin_load_file() {
        var lib_list = this.fsu.read_json_file(Constants.AGGREGATED_LIBRARIES_FILE);
        var gremlin_stmts = [];
        var lib_names = this.collect_lib_names(lib_list);
        var maintainers = this.collect_maintainers(lib_list);
        var lib_maintainers = this.collect_lib_maintainers(maintainers);
        this.fsu.write_json_file(Constants.LIB_NAMES_FILE, lib_names);
        this.fsu.write_json_file(Constants.MAINTAINERS_FILE, maintainers);
        this.fsu.write_json_file(Constants.LIB_MAINTAINERS_FILE, lib_maintainers);

        // Library Vertices
        var sorted_lib_names = (Object.keys(lib_names)).sort();
        for (var i = 0; i < sorted_lib_names.length; i++) {
            var lib_name = sorted_lib_names[i];
            var lib_desc = lib_names[lib_name];
            var stmt = util.format("g.addV('library').property('pk','%s').property('id','%s').property('desc','%s').property('name','%s')",
                this.scrub_value(lib_name), this.scrub_value(lib_name), this.scrub_value(lib_desc), lib_name);
            gremlin_stmts.push(stmt);
        }
        
        // Maintainer Vertices
        var sorted_maintainer_ids = (Object.keys(maintainers)).sort();
        for (var i = 0; i < sorted_maintainer_ids.length; i++) {
            var mid = sorted_maintainer_ids[i];
            var maintainer = maintainers[mid];
            var email = maintainer['email'];
            var mlibs = maintainer['libs'];
            var stmt_parts = [];
            stmt_parts.push(util.format("g.addV('maintainer').property('pk','MAINT-%s').property('id','MAINT-%s').property('email','%s').property('mid','%s')", 
                this.scrub_value(mid), this.scrub_value(mid), this.scrub_value(email), mid));
            stmt_parts.push(util.format("property('libs','%s')", mlibs.join(',')));
            var stmt = stmt_parts.join('.');
            gremlin_stmts.push(stmt);
        }

        // Edges for: library -> uses_lib -> library
        // Edges for: library -> used_by_lib -> library
        for (var i = 0; i < lib_list.length; i++) {
            var lib_info = lib_list[i];
            var lib_name = lib_info['name'];
            var lib_deps = lib_info['dependencies'];
            var sorted_lib_dep_names = (Object.keys(lib_deps)).sort();
            for (var d = 0; d < sorted_lib_dep_names.length; d++) {
                var dep_name = sorted_lib_dep_names[d];
                var stmt = util.format("g.V(['%s','%s']).addE('uses_lib').to(g.V(['%s','%s']))", 
                    this.scrub_value(lib_name), this.scrub_value(lib_name), 
                    this.scrub_value(dep_name), this.scrub_value(dep_name));
                gremlin_stmts.push(stmt);
                var stmt = util.format("g.V(['%s','%s']).addE('used_by_lib').to(g.V(['%s','%s']))", 
                    this.scrub_value(dep_name), this.scrub_value(dep_name),
                    this.scrub_value(lib_name), this.scrub_value(lib_name));
                gremlin_stmts.push(stmt);
            }
        }

        // Edges for: maintainer -> maintains -> library
        var sorted_lib_maintainer_ids = (Object.keys(lib_maintainers)).sort();
        for (var i = 0; i < sorted_lib_maintainer_ids.length; i++) {
            var lib = sorted_lib_maintainer_ids[i];
            var mids = lib_maintainers[lib];
            for (var m = 0; m < mids.length; m++) {
                var mid = mids[m];
                var stmt = util.format("g.V(['MAINT-%s','MAINT-%s']).addE('maintains').to(g.V(['%s','%s']))", 
                    this.scrub_value(mid), this.scrub_value(mid),
                    this.scrub_value(lib), this.scrub_value(lib));
                gremlin_stmts.push(stmt);
            }
        }
        this.fsu.write_text_file(Constants.GREMLIN_LOAD_FILE, gremlin_stmts.join("\n"));
    }

    collect_lib_names(lib_list) {
        var lib_names = {};

        for (var i = 0; i < lib_list.length; i++) {
            var lib_info = lib_list[i];
            var lib_name = lib_info['name'];
            lib_names[lib_name] = lib_info['desc'];
        }
        console.log(util.format("%s lib names found", Object.keys(lib_names).length));
        return lib_names;
    }

    collect_maintainers(lib_list) {
        var maintainers = {};

        for (var i = 0; i < lib_list.length; i++) {
            var lib_info = lib_list[i];
            var lib_name = lib_info['name'];

            if (lib_info['maintainers']) {
                var mlist = lib_info['maintainers'];
                //console.log(util.format("maintainers_present: %s %s", lib_name, mlist.length));
                for (var m = 0; m < mlist.length; m++) {
                    var maintainer = mlist[m];
                    var tokens = maintainer.split(/[ ,]+/);
                    //console.log('maintainer_tokens: ' + JSON.stringify(tokens)  + '  ' + tokens.length);
                    if (tokens.length > 1) {
                        var mid = tokens[0].trim();
                        var email = tokens[1].trim();
                        if (maintainers[mid]) {
                            maintainers[mid]['libs'].push(lib_name);
                        }
                        else {
                            var obj = {};
                            obj['id'] = mid;
                            obj['email'] = email;
                            obj['libs'] = [ lib_name ];
                            maintainers[mid] = obj;
                        }
                    }
                }
            }
            else {
                console.log(util.format("maintainers_absent:  %s", lib_name));
            }
        }
        console.log(util.format("%s maintainers found", Object.keys(maintainers).length));
        return maintainers;
    }

    collect_lib_maintainers(maintainers) {
        var lib_maintainers = {};

        var sorted_maintainer_ids = (Object.keys(maintainers)).sort();
        for (var i = 0; i < sorted_maintainer_ids.length; i++) {
            var mid = sorted_maintainer_ids[i];
            var maintainer = maintainers[mid];
            var mlibs = maintainer['libs'];
            for (var m = 0; m < mlibs.length; m++) {
                var lib = mlibs[m];
                if (lib_maintainers[lib]) {
                    lib_maintainers[lib].push(mid);
                }
                else {
                    lib_maintainers[lib] = [];
                    lib_maintainers[lib].push(mid);
                }
            }
        }
        return lib_maintainers;
    }

    scrub_value(s) {
        // Remove the slashes from the given value due to this error:
        //   ExceptionType : ArgumentException
        //   ExceptionMessage : The resource name presented contains invalid character '/'.
        return s.replace(/\//g, '|').replace(/'/g, '').replace(/`/g, '').trim()
    }
}

module.exports.Wrangler = Wrangler;
