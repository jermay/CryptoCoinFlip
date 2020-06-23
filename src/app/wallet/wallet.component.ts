import { Component, OnInit } from '@angular/core';

import { CoinFlipBetService } from '../coin-flip-bet.service';
import { Web3Service } from '../web3.service';


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  constructor(private service: CoinFlipBetService, private web3: Web3Service) { }

  ngOnInit() {
    this.service.getBalance();
  }

}
