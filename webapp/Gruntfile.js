'use strict';

var request = require('request');

module.exports = function (grunt) {

  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    stylus: {
      dist: {
        files: {
          'public/css/style.css': 'public/css/style.styl'
        }
      }
    }
  });

  // load custom tasks in the tasks/ directory
  grunt.loadTasks('tasks');
  grunt.registerTask('default', ['stylus', 'build-timestamp']);
};