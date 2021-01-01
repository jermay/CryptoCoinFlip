# CryptoCoinFlip

Ethereum based coin flip betting DApp

Blochchain: solidity, truffle, web3.js, ganache, infura<br>
Testing: mocha/chai (contracts), jasmine (frontend)<br>
Front End: angular 8, bootstrap, html/css

Contract deployed to `kovan` test net<br>
https://kovan.etherscan.io/address/0xa10c36F1382B67d58A946C2A604a6BB987dE69Dd

Hosted on Netflify<br>
https://mayjer-cryptocoinflip.netlify.app/

### Requirements

* An Ethereum wallet like <a href="https://metamask.io/" target="_blank">Metamask</a>
* Kovan testnet ETH. Can get some from for free at a <a href="https://gitter.im/kovan-testnet/faucet" target="_blank">faucet</a>
* Make sure to connect the wallet to the Kovan network

## Running Project Locally

To run the project:
1. Clone the githup repo
2. `npm install`
3. Start Gnache. Import an account from Gnache into MetaMask.
4. Deploy the smart contracts in Truffle.
   * Run the smart contract tests in truffle with the test command
5. Copy the `PlaceCoinFlipBet` contract address into the `ContractService` in `/src/app/contract-service.ts`
```
  protected contractAddress = {
    private: '0x837Cc0a50e594F162f6D2625C7a552a2c37A9b55', // ganache
    kovan: '0xa10c36F1382B67d58A946C2A604a6BB987dE69Dd',
  }
```
6. Start app with `npm start` or `ng serve`
7. Open `http://localhost:4200` in the browser

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.23.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
