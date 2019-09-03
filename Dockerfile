FROM node:8.16.1-alpine

# Docker build file for this project.
# See the several "docker_run_xxx" scripts in this repo to execute this container.
# Chris Joakim, Microsoft, 2019/09/03

# Create app directories
RUN mkdir -p /usr/src/app
RUN mkdir -p /usr/src/app/bin
RUN mkdir -p /usr/src/app/webapp/
RUN mkdir -p /usr/src/app/webapp/bin

WORKDIR /usr/src/app

COPY . /usr/src/app

RUN rm -rf node_modules/
RUN npm install

RUN cd webapp/
RUN rm -rf node_modules/
RUN npm install

EXPOSE 3000


# Docker Commands:
# docker build -t cjoakim/azure-cosmos-db-graph-npm-bom-sample . 
# docker image ls cjoakim/azure-cosmos-db-graph-npm-bom-sample:latest
# docker run --rm cjoakim/azure-cosmos-db-graph-npm-bom-sample:latest ls -alR > tmp/docker-container-contents.txt
# docker run -d -e PORT=3000 -p 3000:3000 cjoakim/azure-cosmos-db-graph-npm-bom-sample:latest
# docker ps
# docker stop -t 2 86b125ed43e5  (where 86b125ed43e5 is the CONTAINER ID from 'docker ps')

# Docker Hub:
# docker push cjoakim/azure-cosmos-db-graph-npm-bom-sample:latest

# Azure Container Registry:
# az acr login --name youracr
# docker tag cjoakim/azure-cosmos-db-graph-npm-bom-sample:latest cjoakimacr.azurecr.io/azure-cosmos-db-graph-npm-bom-sample:latest
# docker push youracr.azurecr.io/azure-cosmos-db-graph-npm-bom-sample:latest
# az acr repository list --name youracr --output table
