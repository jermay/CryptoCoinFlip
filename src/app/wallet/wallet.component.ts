import { Component, OnInit } from '@angular/core';
import BN from 'bn.js';
import Web3 from 'web3';

import { CoinFlipBetService } from '../coin-flip-bet.service';


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  readonly web3 = new Web3(Web3.givenProvider);

  constructor(private service: CoinFlipBetService) { }

  ngOnInit() {
    this.service.getBalance();
  }

}
