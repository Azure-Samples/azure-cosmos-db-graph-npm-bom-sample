#!/bin/bash

# Bash and Azure CLI script to create an Azure Container Instance (ACI) for the webapp
# portion of this sample application.  The webapp uses the CosmosDB/Graph database
# which you specify via environment variables passed to the Docker/ACI container.
#
# Chris Joakim, 2021/04/09
#
# Usage:
#   ./aci-create-instance.sh preview   eastus cjoakimcosmosbomgraph cjoakimcosmosbomgraphaci
#   ./aci-create-instance.sh provision eastus cjoakimcosmosbomgraph cjoakimcosmosbomgraphaci

# These parameters are passed to this script as a sequence of command-line args:
MODE=$1
RG_LOC=$2
RG_NAME=$3""
RES_NAME=$4

# This image is public on DockerHub:
ACR_CONTAINER_FULLNAME="cjoakim/azure-cosmos-db-graph-npm-bom-sample:latest"

arg_count=$#

if [ $arg_count -gt 0 ]
then
    if [ $MODE == "provision" ] 
    then
        echo "aci-create-instance, provision mode"
        echo "  RG_LOC:                 "$RG_LOC
        echo "  RG_NAME:                "$RG_NAME
        echo "  RES_NAME:               "$RES_NAME
        echo "  ACR_CONTAINER_FULLNAME: "$ACR_CONTAINER_FULLNAME

        echo "creating resource group "$RG_NAME" in "$RG_LOC
        az group create --location $RG_LOC --name $RG_NAME

        echo "creating container instance "$RES_NAME" in "$RG_NAME
        az container create \
            --resource-group $RG_NAME \
            --name  $RES_NAME \
            --image $ACR_CONTAINER_FULLNAME \
            --dns-name-label $RES_NAME \
            --ports 80 \
            --os-type Linux \
            --restart-policy Always \
            --environment-variables \
                'PORT'=80 \
                'AZURE_COSMOSDB_GRAPHDB_ACCT'=$AZURE_COSMOSDB_GRAPHDB_ACCT \
                'AZURE_COSMOSDB_GRAPHDB_KEY'=$AZURE_COSMOSDB_GRAPHDB_KEY \
                'AZURE_COSMOSDB_GRAPHDB_URI'=$AZURE_COSMOSDB_GRAPHDB_URI \
                'AZURE_COSMOSDB_GRAPHDB_DBNAME'=$AZURE_COSMOSDB_GRAPHDB_DBNAME \
                'AZURE_COSMOSDB_GRAPHDB_GRAPH'=$AZURE_COSMOSDB_GRAPHDB_GRAPH \
                'AZURE_COSMOSDB_GRAPHDB_VIEWS'=$AZURE_COSMOSDB_GRAPHDB_VIEWS 

        az container show --resource-group $RG_NAME --name $RES_NAME --out table > tmp/$RES_NAME"_show.txt"
        cat tmp/$RES_NAME"_show.txt"
    else
        echo "aci-create-instance, preview mode only"
        echo "  RG_LOC:                        "$RG_LOC
        echo "  RG_NAME:                       "$RG_NAME
        echo "  RES_NAME:                      "$RES_NAME
        echo "  ACR_CONTAINER_FULLNAME:        "$ACR_CONTAINER_FULLNAME
        echo "  AZURE_COSMOSDB_GRAPHDB_ACCT:   "$AZURE_COSMOSDB_GRAPHDB_ACCT
        echo "  AZURE_COSMOSDB_GRAPHDB_KEY:    "$AZURE_COSMOSDB_GRAPHDB_KEY
        echo "  AZURE_COSMOSDB_GRAPHDB_URI:    "$AZURE_COSMOSDB_GRAPHDB_URI
        echo "  AZURE_COSMOSDB_GRAPHDB_DBNAME: "$AZURE_COSMOSDB_GRAPHDB_DBNAME
        echo "  AZURE_COSMOSDB_GRAPHDB_GRAPH:  "$AZURE_COSMOSDB_GRAPHDB_GRAPH
        echo "  AZURE_COSMOSDB_GRAPHDB_VIEWS:  "$AZURE_COSMOSDB_GRAPHDB_VIEWS
    fi
fi
