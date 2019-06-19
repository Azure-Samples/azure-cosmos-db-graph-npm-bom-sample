#!/bin/bash

# Bash shell script to create a new git feature branch.
# Use: 
# $ ./newbranch.sh <user-initials-feature-name>
# $ ./newbranch.sh cj-refactor-node-solution-dirs
#
# Chris Joakim, Microsoft, 2019/06/19

while true; do
    read -p "Create feature branch "$1"? " yn
    case $yn in
        [Yy]* ) 
            # Start from the latest version of the master branch:
            git checkout master;
            git reset --hard;
            git pull;

            # Create a "Feature Branch" to do your work on:
            git branch $1;
            git checkout $1;
            git branch;
            git push -u origin $1;
            git branch
            echo '';
            echo 'Next:';
            echo '... make edits to your new feature branch, commit and push them ...';
            echo '... create a pull-request, merge it ...';
            echo '... then delete the local branch with: git branch -d user-feature-name';
            echo '';
            break;;
        [Nn]* )
            echo 'exiting without creating feature branch'
            exit;;
        * )
            echo "Please answer Y or N.";;
    esac
done
