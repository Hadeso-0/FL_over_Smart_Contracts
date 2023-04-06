# Federated Learning via Smart Contract

This is a simple prototype for simulating a federated learning algorithm using an Solidity Smart Contract. The project has been implemented using the truffle suite and a Python Flask backend server.

Install the node dependencies both in the main folder and in the client folder by running (once for each):
> npm install 

In the main directory, to start the python backend server call:
> pip install requirements.txt

Steps to get started: 
Make sure that a mongodb service is running in the background

Running the backend server:
> flask run

In a seperate terminal deploy the smart contracts:
>truffle compile; truffle migrate

Use ganache GUI to see the latest trancsactions and live growth of blockchain

Finally, to run the react-based client, in the client folder:
> npm start 



