import React, { useEffect, useState } from "react";
import { TextField, Button } from "@material-ui/core/";
import Grid from "@material-ui/core/Grid";
import CardContent from "@material-ui/core/CardContent";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Chart from "./Charts";

let params = [];
let local_results = [];

const useStyles = makeStyles({
  root: {
    maxWidth: 400
  },
  title: {
    fontSize: 20
  }
});

async function initializeState(e, contract, accounts) {
  
  await fetch("http://localhost:5000/init")
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(console.log);
}

async function simulateLocal(e, contract, accounts, setResult, results) {
  //e.preventDefault();
  console.log("Local stochastic gradient descent");

  console.log(contract);
  await contract.methods
    .resetState()
    .send({ gas: 200000000, from: accounts[0] });

  await fetch("http://localhost:5000/run_stage")
    .then(res => res.json())
    .then(data => {
      params = data;
    })
    .catch(console.log);
  await fetch("http://localhost:5000/get_results")
    .then(res => res.json())
    .then(data => {
      if (results.length == 0) {
        results = [];
      }
      data.results.forEach(pt => {
        pt.name = (parseInt(pt.name, 10) + local_results.length).toString();
      });
      local_results.push(...data.results);
      setResult([...local_results]);
    });
}

async function simulateFederated(e, contract, accounts) {
  e.preventDefault();
  console.log("Federation happening.");
  console.log(params);

  for (var i = 0; i < 9; i++) {
    console.log("storing value for user", i);
    const gsEst = await contract.methods.store_params(params.weights[i]).estimateGas({from: accounts[i+1]});
    console.log("Weights for user : ",params.weights[i]);
    console.log("Gas rqed : ",gsEst);
    await contract.methods
      .store_params(params.weights[i])
      .send({ from: accounts[i + 1], gas: 20000000 });
  }
  console.log("running aggregation in smart contract");
  const aggres = await contract.methods
    .run_agg()
    .send({ gas: 200000000, from: accounts[0] });
  console.log("runagg:" + aggres);

  const weight_res = await contract.methods
    .read_params()
    .call({ gas: 20000000, from: accounts[0] });
  console.log(weight_res);

  for (var i = 0; i < 9; i++) {
    await contract.methods
      .store_params(params.biases[i])
      .send({ from: accounts[i + 1], gas: 20000000 });
  }

  const aggres2 = await contract.methods
    .run_agg()
    .send({ gas: 200000000, from: accounts[0] });
  console.log("runagg:" + aggres2);

  const bias_res = await contract.methods
    .read_params()
    .call({ gas: 200000000, from: accounts[0] });
  console.log(bias_res);

  let postres = [];

  await fetch("http://localhost:5000/post_params", {
    method: "POST",
    body: JSON.stringify({
      weights: JSON.stringify(weight_res),
      biases: JSON.stringify(bias_res)
    })
  })
    .then(res => res.json())
    .then(data => {
      postres = data;
    });
  console.log(postres);
}

const ClientField = props => {
  const [count, setCount] = useState(0);
  let [results, setResult] = useState([]);
  const classes = useStyles();

  return (
    <Box border={0} borderColor="grey.500">
      {console.log(props)}
      <CardContent>
        <Typography className={classes.header} variant="h3">
          Run Simulation
        </Typography>
      </CardContent>

      <CardContent>
        
      <Button
          variant="contained"
          size="medium"
          style={{
            maxWidth: "150px",
            maxHeight: "45px",
            minWidth: "150px",
            minHeight: "45px",
            margin: "10px"
          }}
          onClick={e => initializeState(e, props.instance, props.accounts)}
        >
          Initialize 
        </Button>

        <Button
          variant="contained"
          color="primary"
          size="medium"
          style={{
            maxWidth: "150px",
            maxHeight: "45px",
            minWidth: "150px",
            minHeight: "45px",
            margin: "10px"
          }}
          onClick={e =>
            simulateLocal(e, props.instance, props.accounts, setResult, count)
          }
        >
          Run Local
        </Button>

        </CardContent>
        <CardContent>
        
        <Button
          variant="contained"
          size="medium"
          color="primary"
          style={{
            maxWidth: "150px",
            maxHeight: "45px",
            minWidth: "150px",
            minHeight: "45px",
            margin: "10px",
            marginTop: '-10px'
          }}
          onClick={e => simulateFederated(e, props.instance, props.accounts)}
        >
          Federate
        </Button>
      </CardContent>
      <CardContent
        style={{
          margin: "auto",
          minHeight: "200px",
          maxHeight: "200px",
          maxWidth: "300px",
          paddingLeft: "0",
        }}
      >
        <Chart datapoints={results} count={count}></Chart>
      </CardContent>
    </Box>
  );
};

export default ClientField;
