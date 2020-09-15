using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Gremlin.Net.Driver;
using Gremlin.Net.Driver.Exceptions;
using Gremlin.Net.Structure.IO.GraphSON;

using Microsoft.Azure.Cosmos;

using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

// Chris Joakim, Microsoft, 2020/09/15
//
// See:
// https://docs.microsoft.com/en-us/azure/cosmos-db/create-graph-dotnet
// https://docs.microsoft.com/en-us/azure/cosmos-db/sql-api-get-started
//
// Command-line use:
// dotnet run list_gremlin_commands data/gremlin_load_file.txt 
// dotnet run process_gremlin_commands ../data/gremlin/gremlin_load_file.txt > tmp/gremlin_load_file.txt
// dotnet run process_gremlin_commands ../data/gremlin/gremlin_queries.txt 
// dotnet run load_materialized_views  ../data/aggregated_libraries.json > tmp/load_materialized_views.txt



namespace BOMClient
{
    class Program
    {
        private static string GraphAccount => EnvVar("AZURE_COSMOSDB_GRAPHDB_ACCT");
        private static string GraphHost = $"{GraphAccount}.gremlin.cosmos.azure.com";
        private static int    GraphPort = 443;
        private static bool   GraphEnableSSL = true;
        private static string GraphDbName => EnvVar("AZURE_COSMOSDB_GRAPHDB_DBNAME");
        private static string GraphPrimaryKey => EnvVar("AZURE_COSMOSDB_GRAPHDB_KEY");
        private static string GraphDatabase => EnvVar("AZURE_COSMOSDB_GRAPHDB_DBNAME");
        private static string GraphContainer => EnvVar("AZURE_COSMOSDB_GRAPHDB_GRAPH");

        private static string GraphUri => EnvVar("AZURE_COSMOSDB_GRAPHDB_URI");
        private static string GraphViewsColl => EnvVar("AZURE_COSMOSDB_GRAPHDB_VIEWS");

        static async Task Main(string[] args)
        {
            string func = args[0].ToLower();
            string infile = null;
            Console.WriteLine("run function: " + func);

            switch (func)
            {
                case "list_gremlin_commands":
                    infile = args[1];
                    ListGremlinCommandsFile(infile);
                    break;
                case "process_gremlin_commands":
                    infile = args[1];
                    ProcessGremlinCommandsFile(infile);
                    break;
                case "load_materialized_views":
                    infile = args[1];
                    await LoadMaterializedViews(infile);
                    break;
                default:
                    Console.WriteLine("Undefined function given on command-line; " + func);
                    break;
            }

            System.Threading.Thread.Sleep(2000);
        }

        private static void ListGremlinCommandsFile(string infile)
        {
            List<string> commands = ReadLines(infile);
            for (int i = 0; i < commands.Count(); i++)
            {
                string command = commands.ElementAt(i);
                Console.WriteLine($"{i} command: {command}");
            }
        }

        private static void ProcessGremlinCommandsFile(string infile)
        {
            List<string> commands = ReadLines(infile);
            GremlinServer gremlinServer = CreateGremlinServer();

            using (var gremlinClient = new GremlinClient(
                gremlinServer,
                new GraphSON2Reader(),
                new GraphSON2Writer(),
                GremlinClient.GraphSON2MimeType))
            {
                Console.WriteLine($"gremlinClient: {gremlinClient}");

                for (int i = 0; i < commands.Count(); i++)
                {
                    string command = commands.ElementAt(i);
                    Console.WriteLine("---");
                    Console.WriteLine($"{i} Command: {command}");

                    var resultSet = SubmitRequest(gremlinClient, command).Result;
                    if (resultSet.Count > 0)
                    {
                        Console.WriteLine("Result:");
                        foreach (var result in resultSet)
                        {
                            string output = JsonConvert.SerializeObject(result);
                            Console.WriteLine($"{output}");
                        }
                        Console.WriteLine();
                    }
                    PrintStatusAttributes(resultSet.StatusAttributes);
                    Console.WriteLine();
                }
            }
        }

        private static GremlinServer CreateGremlinServer()
        {
            Console.WriteLine("BOMClient:");
            Console.WriteLine($"GraphHost:       {GraphHost}");
            Console.WriteLine($"GraphPrimaryKey: {GraphPrimaryKey}");
            Console.WriteLine($"GraphDatabase:   {GraphDatabase}");
            Console.WriteLine($"GraphContainer:  {GraphContainer}");
            string GraphContainerLink = "/dbs/" + GraphDatabase + "/colls/" + GraphContainer;
            Console.WriteLine($"ContainerLink:   {GraphContainerLink}");

            Console.WriteLine(
                $"Connecting to: host: {GraphHost}, port: {GraphPort}, container link: {GraphContainerLink}, ssl: {GraphEnableSSL}");
            GremlinServer gremlinServer = new GremlinServer(
                GraphHost,
                GraphPort,
                enableSsl: true,
                username: GraphContainerLink,
                password: GraphPrimaryKey);
            Console.WriteLine($"gremlinServer: {gremlinServer}");
            return gremlinServer;
        }

        private static Task<ResultSet<dynamic>> SubmitRequest(
            GremlinClient gremlinClient, string command)
        {
            try
            {
                return gremlinClient.SubmitAsync<dynamic>(command);
            }
            catch (ResponseException e)
            {
                Console.WriteLine("Request Error");
                Console.WriteLine($"StatusCode: {e.StatusCode}");
                PrintStatusAttributes(e.StatusAttributes);
                Console.WriteLine($"[\"x-ms-retry-after-ms\"] : { GetValueAsString(e.StatusAttributes, "x-ms-retry-after-ms")}");
                Console.WriteLine($"[\"x-ms-activity-id\"] : { GetValueAsString(e.StatusAttributes, "x-ms-activity-id")}");
                throw;
            }
        }

        private static void PrintStatusAttributes(
            IReadOnlyDictionary<string, object> attributes)
        {
            Console.WriteLine($"x-ms-status-code           : { GetValueAsString(attributes, "x-ms-status-code")}");
            Console.WriteLine($"x-ms-total-server-time-ms] : { GetValueAsString(attributes, "x-ms-total-server-time-ms")}");
            Console.WriteLine($"x-ms-total-request-charge] : { GetValueAsString(attributes, "x-ms-total-request-charge")}");
        }

        public static string GetValueAsString(
            IReadOnlyDictionary<string, object> dictionary, string key)
        {
            return JsonConvert.SerializeObject(GetValueOrDefault(dictionary, key));
        }

        private static object GetValueOrDefault(
            IReadOnlyDictionary<string, object> dictionary, string key)
        {
            if (dictionary.ContainsKey(key))
            {
                return dictionary[key];
            }
            return null;
        }

        public static async Task LoadMaterializedViews(string infile)
        {
            bool DoLibraryInserts = true;
            bool DoMaintainerInserts = true;
            int maxDocs = 99999;
            CosmosClient client = new CosmosClient(GraphUri, GraphPrimaryKey);
            Console.WriteLine($"client: {client}");

            Database database = await client.CreateDatabaseIfNotExistsAsync(GraphDatabase);
            Console.WriteLine($"database: {database}");

            Container container = await database.CreateContainerIfNotExistsAsync(GraphViewsColl, "/pk");
            Console.WriteLine($"container: {container}");

            var librariesJson = ReadText(infile);
            var librariesArray = JArray.Parse(librariesJson);
            int libraryCount = 0;
            Console.WriteLine($"librariesArray count: {librariesArray.Count()}");

            foreach (var lib in librariesArray)
            {
                libraryCount++;
                JObject obj = JObject.Parse(lib.ToString());
                string name = obj.SelectToken("name").ToString();
                obj.Remove("id");
                obj.Add("id", scrubPk(name));
                obj.Add("pk", scrubPk(name));
                obj.Add("key", name);
                obj.Add("seq", libraryCount);
                obj.Add("doctype", "library");
                PartitionKey pk = new PartitionKey(scrubPk(name));

                if (DoLibraryInserts)
                {
                    if (libraryCount < maxDocs)
                    {
                        Console.WriteLine($"library obj: {obj}");
                        try
                        {
                            ItemResponse<JObject> resp = await container.CreateItemAsync<JObject>(obj, pk);
                            Console.WriteLine(resp.Resource);
                            Console.WriteLine(resp.RequestCharge);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine($"Exception: {e}");
                        }
                    }
                }
            }
            librariesJson = null;
            librariesArray = null;

            var maintainersJson = ReadText("../data/maintainers.json");
            var maintainersObject = JObject.Parse(maintainersJson);
            int maintainerCount = 0;
            foreach (var maintainer in maintainersObject)
            {
                maintainerCount++;
                string name = maintainer.Key;
                JToken value = maintainer.Value;
                JObject obj = JObject.Parse(value.ToString());
                obj.Remove("id");
                obj.Add("id", Guid.NewGuid().ToString());
                obj.Add("pk", scrubPk(name));
                obj.Add("key", name);
                obj.Add("seq", maintainerCount);
                obj.Add("doctype", "maintainer");
                PartitionKey pk = new PartitionKey(scrubPk(name));

                if (DoMaintainerInserts)
                {
                    if (maintainerCount < maxDocs)
                    {
                        Console.WriteLine($"maintainer obj: {obj}");
                        try
                        {
                            ItemResponse<JObject> resp = await container.CreateItemAsync<JObject>(obj, pk);
                            Console.WriteLine(resp.Resource);
                            Console.WriteLine(resp.RequestCharge);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine($"Exception: {e}");
                        }
                    }
                }
            }
            maintainersJson = null;
            maintainersObject = null;
        }

        private static string scrubPk(string s)
        {
            return s.Replace("/", "|").Replace("'", "").Replace("`", "").Trim();
        }

        private static string EnvVar(string name)
        {
            if (name == null)
            {
                throw new ArgumentException("EnvVar - name value is null");
            }
            try
            {
                return Environment.GetEnvironmentVariable(name);
            }
            catch (Exception e)
            {
                throw new ArgumentException("EnvVar - missing env var: " + name + ".  " + e.Message);
            }
        }

        private static string ReadText(string filename)
        {
            if (filename != null)
            {
                return System.IO.File.ReadAllText(filename);
            }
            return null;
        }

        private static List<string> ReadLines(string filename)
        {
            List<string> lines = new List<string>();
            if (filename != null)
            {
                string line = null;
                System.IO.StreamReader file = new System.IO.StreamReader(filename);
                while ((line = file.ReadLine()) != null)
                {
                    lines.Add(line);
                }
            }
            return lines;
        }

        private static string PromptUser(string message)
        {
            Console.WriteLine(message);
            return Console.ReadLine();
        }
    }
}
