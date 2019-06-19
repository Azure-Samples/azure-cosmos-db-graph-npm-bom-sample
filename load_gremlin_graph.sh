#!/bin/bash

# Bash shell script to load the pre-wrangled Gremlin statements.
# Chris Joakim, Microsoft, 2019/06/06

echo ''
echo '=== load_gremlin_graph ...'
node load_gremlin_graph.js data/gremlin/gremlin_load_file.txt 60 > tmp/load_gremlin_graph.txt

echo 'done'
