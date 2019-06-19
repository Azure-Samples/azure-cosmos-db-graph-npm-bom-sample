#!/bin/bash

# Bash shell script to execute the "spidering" process vs npm.
# Chris Joakim, Microsoft, 2019/06/06

iterations=10

rm -rf data/libs/
mkdir -p data/libs/

date > tmp/spider_start.txt

node main.js spider_npm $iterations > tmp/spider_npm.txt

date > tmp/spider_finish.txt

cat tmp/spider_start.txt
cat tmp/spider_finish.txt

echo 'done'
