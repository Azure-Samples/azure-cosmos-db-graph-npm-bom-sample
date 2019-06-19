'use strict';

// Class D3CsvUtil is used to create CSV content for D3.js
// from the results of a Gremlin Dependency Graph query.
// Chris Joakim, Microsoft, 2019/06/06

const events = require('events');
const util   = require('util');

class D3CsvUtil extends events.EventEmitter {

    constructor() {
        super();
    }

    gremlin_dep_graph_to_d3_csv(gremlin_get_dep_graph_result) {
        var csv_lines = [];
        try {
            var items = gremlin_get_dep_graph_result['_items'];
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var objects = item['objects'];
                var obj_list = [];
                for (var o = 0; o < objects.length; o++) {
                    var obj = objects[o]; // 2909d341-099d-4791-87d8-d2e5700419dd
                    if (obj.length > 30) {
                        // it's an Edge
                    }
                    else {
                        // it's a Vertex
                        obj_list.push(this.scrub_value(obj));
                        //console.log('pushing onto obj_list: ' + obj);
                        var str = util.format("%s %s %s", i, o, obj);
                    }
                }
                var line = obj_list.join('.');
                csv_lines.push(line + ',0');
            }
            console.log('D3CsvUtil#gremlin_bom_to_d3_csv - lines: ' + csv_lines.length);
        }
        catch(e) {
            console.log('D3CsvUtil#gremlin_bom_to_d3_csv - Exception: ' + e);
        }
        finally {
            csv_lines.sort();
            csv_lines.unshift('id,value');
            return csv_lines.join("\n");
        }
    }

    scrub_value(s) {
        return s.replace(/\./g, '_').replace(/'/g, '').replace(/`/g, '').trim()
    }
}

module.exports.D3CsvUtil = D3CsvUtil;

// Example CSV produces for D3.js
//
// id,value
// tcx-js,0
// tcx-js.m26-js,0
// tcx-js.node-expat,0
// tcx-js.node-expat.bindings,0
// tcx-js.node-expat.bindings.file-uri-to-path,0
// tcx-js.node-expat.nan,0
// tcx-js.sb-js,0
// tcx-js.sb-js.path,0
// tcx-js.sb-js.path.process,0
// tcx-js.sb-js.path.util,0
// tcx-js.sb-js.path.util.inherits,0
// tcx-js.sb-js.path.util.is-arguments,0
// tcx-js.sb-js.path.util.is-generator-function,0
// tcx-js.sb-js.path.util.object_entries,0
// tcx-js.sb-js.path.util.object_entries.define-properties,0
// tcx-js.sb-js.path.util.object_entries.define-properties.object-keys,0
// tcx-js.sb-js.path.util.object_entries.es-abstract,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.es-to-primitive,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.es-to-primitive.is-callable,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.es-to-primitive.is-date-object,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.es-to-primitive.is-symbol,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.es-to-primitive.is-symbol.has-symbols,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.function-bind,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.has,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.has.function-bind,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.is-callable,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.is-regex,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.is-regex.has,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.is-regex.has.function-bind,0
// tcx-js.sb-js.path.util.object_entries.es-abstract.object-keys,0
// tcx-js.sb-js.path.util.object_entries.function-bind,0
// tcx-js.sb-js.path.util.object_entries.has,0
// tcx-js.sb-js.path.util.object_entries.has.function-bind,0
// tcx-js.sb-js.path.util.safe-buffer,0
