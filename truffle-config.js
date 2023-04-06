const path = require("path");

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      hosy: '127.0.0.1',
      port: 7545,
      gas: 5000000000000,
      network_id: '5777',
    }
  }
};
