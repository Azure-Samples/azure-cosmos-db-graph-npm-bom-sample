#!/bin/bash

# Bash script to execute the Docker container run the web app.
# Chris Joakim, Microsoft, 2019/09/03

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
    node webapp/bin/www

