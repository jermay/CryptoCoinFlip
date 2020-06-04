import Web3 from 'web3';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  instance: Web3;
  private initialized: Promise<Web3>;

  constructor() {
    this.initWeb3();
  }

  async initWeb3(): Promise<Web3> {
    if (this.initialized) {
      return this.initialized;
    }

    this.initialized = new Promise(async (res, reject) => {    
      console.log('initializing Web3...');
      let provider: any;
      if ((<any>window).ethereum) {
        provider = (<any>window).ethereum;
        try {
          await (<any>window).ethereum.enable();
        } catch (error) {
          return reject('User denied account access');
        }
      } else if ((<any>window).web3) {
        provider = (<any>window).web3.currentProvider;
      } else {
        provider = Web3.givenProvider;
      }
      this.instance = new Web3(provider);
      console.log('initWeb3:', this.instance);

      res(this.instance);
    });

    return this.initialized;
  }
}
