#!/bin/bash

# Bash shell script to load both the CosmosDB Graph data the Materalized Views.
# Chris Joakim, Microsoft, 2020/09/15

mkdir tmp

echo 'process_gremlin_commands with gremlin_load_file ...'
dotnet run process_gremlin_commands ../data/gremlin/gremlin_load_file.txt  > tmp/gremlin_load_file.txt

echo 'load_materialized_views ...'
dotnet run load_materialized_views ../data/aggregated_libraries.json > tmp/load_materialized_views.txt

# dotnet run list_gremlin_commands ../data/gremlin/gremlin_load_file.txt
# dotnet run process_gremlin_commands ../data/gremlin/gremlin_queries.txt 

echo 'done'
