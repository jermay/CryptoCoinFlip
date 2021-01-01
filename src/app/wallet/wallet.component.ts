import { Component, OnInit } from '@angular/core';

import { CoinFlipBetService } from '../coin-flip-bet.service';
import { Web3Service } from '../web3.service';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  network = 'Local';
  txtDestroy = new FormControl('');

  constructor(private service: CoinFlipBetService, private web3: Web3Service) { }

  ngOnInit() {
    this.service.getBalance();
    this.web3.instance.eth.net
      .getNetworkType().then(network => this.network = network);
  }

  onDestroy() {    
    const confirmation = this.txtDestroy.value;
    this.service.destroyContract(confirmation)
      .then(response => {
        console.log('Success. Goodbye contract!');
        console.log(response);
      }).catch(error => console.error(error));
  }
}
