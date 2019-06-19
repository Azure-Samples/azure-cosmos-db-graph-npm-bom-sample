
# PowerShell script to execute the "spidering" process vs npm.
# Chris Joakim, Microsoft, 2019/06/06

Remove-Item data\libs -Recurse -Force
mkdir -p data/libs/
mkdir tmp

date > tmp/spider_start.txt

node main.js spider_npm 10 > tmp/spider_npm.txt

date > tmp/spider_finish.txt

cat tmp/spider_start.txt
cat tmp/spider_finish.txt

echo 'done'
