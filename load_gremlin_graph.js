// Program to Load and Query a CosmosDB Gremlin Database
// Chris Joakim, Microsoft, 2021/10/08

const fs = require('fs');
const gremlin = require('gremlin');

// command-line args
const load_file = process.argv[2];
const load_sleep_ms = Number(process.argv[3]);

// env vars
const acct_name = process.env.AZURE_COSMOSDB_GRAPHDB_ACCT;
const db_key    = process.env.AZURE_COSMOSDB_GRAPHDB_KEY;
const db_name   = process.env.AZURE_COSMOSDB_GRAPHDB_DBNAME;
const coll_name = process.env.AZURE_COSMOSDB_GRAPHDB_GRAPH;

const coll_link = '/dbs/' + db_name + '/colls/' + coll_name;
const endpoint  = 'wss://' + acct_name + '.gremlin.cosmosdb.azure.com:443/gremlin';
const authenticator = new gremlin.driver.auth.PlainTextSaslAuthenticator(coll_link, db_key);

console.log('acct_name:     ' + acct_name);
console.log('db_name:       ' + db_name);
console.log('coll_name:     ' + coll_name);
console.log('db_key:        ' + db_key);
console.log('endpoint:      ' + endpoint);
console.log('coll_link:     ' + coll_link); 
console.log('load_file:     ' + load_file);
console.log('load_sleep_ms: ' + load_sleep_ms); 

var load_statements = null;
var load_row_number = -1;

const client = new gremlin.driver.Client(
    endpoint, 
    { 
        authenticator,
        traversalsource : "g",
        rejectUnauthorized : true,
        mimeType : "application/vnd.gremlin-v2.0+json"
    }
);

// .then(load_db)

client.open()
.then(drop_graph)
.then(count_vertices)
.then(load_db)
.then(count_vertices)
.catch((err) => {
    console.error("Error running query...");
    console.error(err)
}).then((res) => {
    client.close();
    finish();
}).catch((err) => 
    console.error("Fatal error:", err)
);    


function drop_graph() {
    console.log('drop_graph...');
    return client.submit('g.V().drop()', { }).then(function (result) {
        console.log("drop_graph result: %s\n", JSON.stringify(result));
    });
}

function count_vertices() {
    console.log('count_vertices...');
    return client.submit("g.V().count()", { }).then(function (result) {
        console.log("count: %s\n", JSON.stringify(result));
    });
}

function load_db() {
    console.log('reading file: ' + load_file);
    load_statements = fs.readFileSync(load_file).toString().split("\n");
    console.log(load_statements.length);

    if (load_row_number < load_statements.length) {
        load_next_row();
    }
    else {
        console.log('load_db completed');
        return;
    }
}

function load_next_row() {
    load_row_number = load_row_number + 1;
    var load_stmt = load_statements[load_row_number];
    console.log('load_next_row ' + load_row_number + ' : ' + load_stmt); 

    return client.submit(load_stmt).then(function (result) {
        console.log("Result: %s\n", JSON.stringify(result));
        setTimeout(load_next_row, load_sleep_ms);
    });
}

function finish() {
    console.log("Finished");
    //console.log('Press any key to exit');
    process.stdin.resume();
    process.stdin.on('data', process.exit.bind(process, 0));
}
