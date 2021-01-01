import Web3 from 'web3';
import { Injectable } from '@angular/core';

declare let window: any;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  instance: Web3;
  private initialized: Promise<Web3>;

  constructor() {
    this.initWeb3();
  }

  initWeb3(): Promise<Web3> {
    if (!!this.initialized) {
      return this.initialized;
    }

    this.initialized = new Promise(async (res, reject) => {
      console.log('initializing Web3...');
      let provider;
      if (window.ethereum) {
        console.log('web3 init: found window.ethereum');
        // provider = window.ethereum;
        provider = Web3.givenProvider;
        this.enableEthereum();
      } else if (window.web3) {
        console.log('web3 init: using web3.currentProvider');
        this.instance = window.web3.currentProvider;
      } else {
        console.log('web3 init: using localhost');
        this.instance = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
      }
      console.log('web3 provider: ', provider);
      this.instance = new Web3(provider);
      console.log('initWeb3:', this.instance);

      res(this.instance);
    });

    console.log('init web3: promise: ', this.initialized);
    return this.initialized;
  }

  private async enableEthereum() {
    try {
      await window.ethereum.enable();
    } catch (error) {
      console.error(error);
    }
  }

}
