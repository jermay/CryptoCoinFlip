import BN from 'bn.js';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoinFlipBetService } from '../coin-flip-bet.service.js';
import { BetPlacedEvent } from '../bet-placed-event.js';
import { BetResultEvent } from '../bet-result-event.js';
import { Web3Service } from '../web3.service.js';

@Component({
  selector: 'app-place-bet',
  templateUrl: './place-bet.component.html',
  styleUrls: ['./place-bet.component.css']
})
export class PlaceBetComponent implements OnInit {

  betForm: FormGroup;
  message = "";
  minBet = new BN('0');
  maxBet = new BN('0');

  constructor(private service: CoinFlipBetService, private web3: Web3Service, private fb: FormBuilder) { }

  ngOnInit() {
    this.updateMaxBet();

    this.betForm = this.fb.group({
      betOn: ['false'],
      betAmount: ['0.001']
    });
    this.service.minBet().then(b => this.minBet = b);
  }

  async updateMaxBet() {
    await this.service.getBalance();
    await this.service.maxBet().then(b => this.maxBet = b);
    if (this.service.balance.lt(this.maxBet)) {
      this.maxBet = this.service.balance;
    }
  }

  placeBet() {
    this.message = '';
    let vals = {
      betOn: this.betForm.value.betOn,
      amount: this.web3.instance.utils.toWei(this.betForm.value.betAmount.toString(), 'ether')
    };
    console.log(`Place Bet clicked. betOn: ${vals.betOn}, amount: ${this.web3.instance.utils.fromWei(vals.amount)} ETH (${vals.amount} wei)`);

    this.service.placeBet(vals.betOn, vals.amount)
      .catch(err => {
        this.message = 'Error sending bet';
        console.log(err);
      }).finally(() => this.updateMaxBet());
  }

}
