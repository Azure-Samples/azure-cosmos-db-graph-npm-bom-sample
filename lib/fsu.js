'use strict';

var fs     = require('fs');
var events = require('events');
var util   = require('util');

const Constants = require('./constants');

// Utility class for all File System operations in this project.
// Chris Joakim, Microsoft, 2019/06/06


class FSUtil extends events.EventEmitter {

    constructor() {
        super();
    }

    read_text_file(infile) {
        return fs.readFileSync(infile).toString();
    }
    
    read_json_file(infile) {
        return JSON.parse(fs.readFileSync(infile).toString());
    }

    read_directory_entries(dir) {
        return fs.readdirSync(dir);
    }

    write_text_file(outfile, text) {
        fs.writeFileSync(outfile, text);
        console.log('file written: ' + outfile);
    }

    write_json_file(outfile, obj) {
        fs.writeFileSync(outfile, JSON.stringify(obj, null, 2));
        console.log('file written: ' + outfile);
    }
}

module.exports.FSUtil = FSUtil;
