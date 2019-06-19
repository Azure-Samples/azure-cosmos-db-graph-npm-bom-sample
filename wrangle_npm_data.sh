#!/bin/bash

# Bash shell script to wrangle the data obtained by the "spider_npm" process.
# Chris Joakim, Microsoft, 2019/06/15

node main.js aggregate_lib_files

node main.js create_gremlin_load_file 

echo 'done'
