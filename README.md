# CryptoCoinFlip

Ethereum based coin flip betting DApp

To run the project:
1. Clone the githup repo
2. `npm install`
3. Start Gnache. Import an account from Gnache into MetaMask.
4. Deploy the smart contracts in Truffle.
   * Run the smart contract tests in truffle with the test command
5. Copy the `PlaceCoinFlipBet` contract address into the `CoinFlipBetService` in `/src/coin-flip-bet-service.ts`
   * `private readonly contractAddress = '0x...';`
   * I'll be looking into how to move this into a config file for phase 2
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
