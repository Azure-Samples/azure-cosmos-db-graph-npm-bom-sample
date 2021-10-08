
# PowerShell script to load the materialized views into CosmosDB/Graph with the SQL API.
# Chris Joakim, Microsoft, 2021/10/08

echo ''
echo '=== load_materialized_views ...'
node load_materialized_views.js dev views 50

echo 'done'
