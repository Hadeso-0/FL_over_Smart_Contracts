#!/bin/bash
truffle develop &
truffle compile
truffle migrate
flask run &
cd client 
npm install 
npm start

