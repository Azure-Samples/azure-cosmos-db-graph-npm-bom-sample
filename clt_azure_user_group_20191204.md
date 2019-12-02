# Charlotte Azure User Group

- https://cltazure.azurewebsites.net
- https://www.meetup.com/Charlotte-Microsoft-Azure1/events/qlmdrqyzqbgb/
- https://github.com/Azure-Samples/azure-cosmos-db-graph-npm-bom-sample

---

## About Chris

- Azure Cloud Solution Architect at Microsoft, 4 years
- chjoakim@microsoft.com
- Current skills: **NoSQL/Azure CosmosDB**, Java/Spring, Node.js/MEAN, Python, .Net Core, **Azure DevOps**
- Dead-like-COBOL skills: COBOL/CICS, **IMS/DB**, Smalltalk, C++, Flex/ActionScript, Ruby on Rails, Clojure

---

## Topics

### Part 1 - Intro

  - [History of NoSQL](img/nosql-history.png)
  - [Spectrum of Databases](img/spectrum-800.png)
  - [Intro to CosmosDB](img/azure-cosmosdb-2019.png)

### Part 2 - Graph Bill-of-Material App

  - [Graph Database Concepts](img/sample-graph.png)
  - [Apache Tinkerpop](http://tinkerpop.apache.org) 
  - [Gremlin Syntax](http://tinkerpop.apache.org/docs/current/reference/#basic-gremlin)
  - **Graph API Bill-of-Materials Reference Application**
    - This repo: https://github.com/Azure-Samples/azure-cosmos-db-graph-npm-bom-sample
  - [NPM Libraries as a Bill-of-Material example](https://www.npmjs.com)
  - Data mining from [Seed Data](data/seed_libraries.json), and Wrangling into Gremlin Statements
    - npm list ; npm view tedious -json | jq
  - [Load the Database - Graph](data/gremlin/gremlin_load_file.txt)
  - Datastructure Driven Design vs Query Driven Design
  - [Load the Database - Materialized View](data/aggregated_libraries.json)
  - [Query the Graph](https://github.com/Azure-Samples/azure-cosmos-db-graph-npm-bom-sample#gremlin-queries)
  - [Express.js Web Application](https://expressjs.com) with [D3.js](https://d3js.org) **UI Visualization**
  - Also, the [The Six Degrees of Kevin Bacon](https://github.com/cjoakim/azure-cosmos-graph)

### Part 3 - SQL API, Geo Spatial, Notebooks

  - Internet Engineering Task Force (IETF) - [GeoJSON](https://geojson.org)
  - SQL API with [Geo-Spatial Data](https://docs.microsoft.com/en-us/azure/cosmos-db/geospatial) 
  - Use [Jupyter Notebooks](https://jupyter.org) to query the Database
