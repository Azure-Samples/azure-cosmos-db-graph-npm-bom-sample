#!/bin/bash

# Bash script to execute the Gruntfile for CSS, check for outdated npm libraries,
# then start the web application with nodemon on localhost.
# Chris Joakim, Microsoft, 2019/06/22

grunt 

# npm outdated

nodemon bin/www
