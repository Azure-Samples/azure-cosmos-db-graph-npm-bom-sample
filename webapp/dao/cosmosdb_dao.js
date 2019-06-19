'use strict';

// Class CosmosDbDao implements DAO functionality for both the CosmosDB Gremlin/Graph.
// Chris Joakim, Microsoft, 2019/06/06

// Node.js standard libraries
const events = require('events');
const util   = require('util');

// Gremlin SDK
const gremlin = require('gremlin');

// SQL SDK
const cosmos = require("@azure/cosmos");
const CosmosClient = cosmos.CosmosClient;

class CosmosDbDao extends events.EventEmitter {

    constructor() {
        super();

        // Env Var config
        this.cosmos_gremlin_acct   = process.env.AZURE_COSMOSDB_GRAPHDB_ACCT;   // cjoakimcosmosdbgremlin
        this.cosmos_gremlin_key    = process.env.AZURE_COSMOSDB_GRAPHDB_KEY;    // secret
        this.cosmos_gremlin_db     = process.env.AZURE_COSMOSDB_GRAPHDB_DBNAME; // dev
        this.cosmos_gremlin_graph  = process.env.AZURE_COSMOSDB_GRAPHDB_GRAPH;  // npm
        this.cosmos_gremlin_views  = process.env.AZURE_COSMOSDB_GRAPHDB_VIEWS;  // views
        this.cosmos_gremlin_uri    = process.env.AZURE_COSMOSDB_GRAPHDB_URI;    // https://cjoakimcosmosdbgremlin.documents.azure.com:443/
        this.cosmos_gremlin_wssuri = 'wss://' + this.cosmos_gremlin_acct + '.gremlin.cosmosdb.azure.com:443/gremlin';
        this.graph_coll_link       = '/dbs/' + this.cosmos_gremlin_db + '/colls/' + this.cosmos_gremlin_graph;

        console.log('cosmos_gremlin_acct:   ' + this.cosmos_gremlin_acct);
        console.log('cosmos_gremlin_db:     ' + this.cosmos_gremlin_db);
        console.log('cosmos_gremlin_graph:  ' + this.cosmos_gremlin_graph);
        console.log('cosmos_gremlin_views:  ' + this.cosmos_gremlin_views);
        console.log('cosmos_gremlin_wssuri: ' + this.cosmos_gremlin_wssuri);
        console.log('graph_coll_link:       ' + this.graph_coll_link); 

        // Gremlin client
        var guri  = this.cosmos_gremlin_wssuri;
        var gkey  = this.cosmos_gremlin_key
        var glink = this.graph_coll_link;
        var authenticator = new gremlin.driver.auth.PlainTextSaslAuthenticator(glink, gkey);
        this.gremlin_client = new gremlin.driver.Client(
            guri, 
            { 
                authenticator,
                traversalsource : "g",
                rejectUnauthorized : true,
                mimeType : "application/vnd.gremlin-v2.0+json"
            }
        );

        // SQL client
        var suri = this.cosmos_gremlin_uri; 
        var skey = this.cosmos_gremlin_key;
        this.sql_client = new CosmosClient({ endpoint: suri, auth: { masterKey: skey } });
    }

    async gremlin_submit_stmt(stmt, options) {
        console.log('gremlin_submit_stmt: ' + stmt + ' options: ' + options);
        return await this.gremlin_client.submit(stmt, options);
    }

    async gremlin_get_vertex(vid) {
        var stmt = util.format('g.V(["%s", "%s"])', vid, vid);
        console.log('gremlin_get_vertex: ' + stmt);
        return await this.gremlin_client.submit(stmt, {});
    }
    
    async gremlin_get_dep_graph(vid) {
        var stmt = util.format('g.V(["%s", "%s"]).emit().repeat(outE("uses_lib").inV()).times(16).path().by("id")', vid, vid);
        console.log('gremlin_get_dep_graph: ' + stmt);
        return await this.gremlin_client.submit(stmt, {});
    }

    async vertices_updated_since(epoch) {
        var stmt = util.format("g.V().has('updated', gte(%s)).values('id')", epoch);
        return await this.gremlin_client.submit(stmt, {});0
    }

    // ===============================================================================

    // SQL client methods here
    // See https://docs.microsoft.com/en-us/azure/cosmos-db/sql-api-nodejs-get-started

    async sql_create_doc(db_name, coll_name, doc) {
        return await this.sql_client.database(db_name).container(coll_name).items.create(doc);
    }

    async sql_query(db_name, coll_name, query_spec) {
        return await this.sql_client.database(db_name).container(coll_name).items.query(query_spec).toArray();
    }

    async materialized_library_view(bom_id) {
        var db_name   = this.cosmos_gremlin_db;
        var coll_name = this.cosmos_gremlin_views;
        var query_spec = {};
        query_spec['query'] = util.format('SELECT * from c where c.pk = "%s" and c.doctype = "library"', bom_id);
        query_spec['parameters'] = [];
        return await this.sql_client.database(db_name).container(coll_name).items.query(query_spec).toArray();
    }

    async materialized_maintainer_view(maint_id) {
        var db_name   = this.cosmos_gremlin_db;
        var coll_name = this.cosmos_gremlin_views;
        var query_spec = {};
        query_spec['query'] = util.format('SELECT * from c where c.pk = "%s" and c.doctype = "maintainer"', maint_id);
        query_spec['parameters'] = [];
        return await this.sql_client.database(db_name).container(coll_name).items.query(query_spec).toArray();
    }
}

module.exports.CosmosDbDao = CosmosDbDao;
