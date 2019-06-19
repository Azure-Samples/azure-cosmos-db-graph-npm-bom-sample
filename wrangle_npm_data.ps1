
# PowerShell script to wrangle the data obtained by the "spider_npm" process.
# Chris Joakim, Microsoft, 2019/06/06

node main.js aggregate_lib_files

node main.js create_gremlin_load_file 

echo 'done'
