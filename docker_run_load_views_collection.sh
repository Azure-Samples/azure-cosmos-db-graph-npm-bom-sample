#!/bin/bash

# Bash script to execute the Docker container to load the CosmosDB/Gremlin "views" container.
# See the corresponding "sudo_" script in this repository.
# Chris Joakim, Microsoft, 2021/10/08

docker run -it \
    -e PORT=3000 \
    -e AZURE_COSMOSDB_GRAPHDB_ACCT=$AZURE_COSMOSDB_GRAPHDB_ACCT \
    -e AZURE_COSMOSDB_GRAPHDB_KEY=$AZURE_COSMOSDB_GRAPHDB_KEY \
    -e AZURE_COSMOSDB_GRAPHDB_URI=$AZURE_COSMOSDB_GRAPHDB_URI \
    -e AZURE_COSMOSDB_GRAPHDB_DBNAME=$AZURE_COSMOSDB_GRAPHDB_DBNAME \
    -e AZURE_COSMOSDB_GRAPHDB_GRAPH=$AZURE_COSMOSDB_GRAPHDB_GRAPH \
    -e AZURE_COSMOSDB_GRAPHDB_VIEWS=$AZURE_COSMOSDB_GRAPHDB_VIEWS \
    -p 3000:3000 \
    cjoakim/azure-cosmos-db-graph-npm-bom-sample:latest \
    load_materialized_views.js $AZURE_COSMOSDB_GRAPHDB_DBNAME $AZURE_COSMOSDB_GRAPHDB_VIEWS 100
