#!/bin/bash
PATH=$PATH:/usr/local/bin
git stash
git pull
git submodule foreach git pull origin master
git submodule update
sudo service cis-scanner stop
sudo service cis-web stop
npm install
grunt dist
sudo service cis-scanner start
sudo service cis-web start
