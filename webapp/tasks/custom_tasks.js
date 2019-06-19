
var fs = require('fs');

module.exports = function(grunt) {

  grunt.registerTask('build-timestamp', 'Create the build_timestamp.json file', function() {
    var ts = new Date().toString();
    var obj = {build_timestamp: ts};
    grunt.log.writeln('build-timestamp: ' + ts);

    var js_file = fs.openSync('build_timestamp.json', 'w+');
    fs.writeSync(js_file, JSON.stringify(obj));
    fs.closeSync(js_file);
  });

};
