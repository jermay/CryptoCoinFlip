import BN from 'bn.js';
import Web3 from 'web3';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CoinFlipBetService } from '../coin-flip-bet.service.js';
import { BetPlacedEvent } from '../bet-placed-event.js';
import { BetResultEvent } from '../bet-result-event.js';

@Component({
  selector: 'app-place-bet',
  templateUrl: './place-bet.component.html',
  styleUrls: ['./place-bet.component.css']
})
export class PlaceBetComponent implements OnInit/*, OnDestroy */{

  readonly web3 = new Web3(Web3.givenProvider);
  betForm: FormGroup;
  message = "";
  betResults: BetResultEvent[] = [];
  waitingForBetResults: boolean = false;

  minBet = new BN('0');
  maxBet = new BN('0');

  constructor(private service: CoinFlipBetService, private fb: FormBuilder) { }

  ngOnInit() {    
    this.updateMaxBet();    

    this.betForm = this.fb.group({
      betOn: ['false'],
      betAmount: ['0.001']
    });
    this.service.minBet().then(b => this.minBet = b);
    this.service.betPlaced.subscribe(this.onBetPlaced.bind(this));
    this.service.betResult.subscribe(this.onBetResult.bind(this));
  }

  // ngOnDestroy() {
  //   this.service.betPlaced.unsubscribe();
  //   this.service.betResult.unsubscribe();
  // }

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
      amount: this.web3.utils.toWei(this.betForm.value.betAmount.toString(), 'ether')
    };
    console.log(`Place Bet clicked. betOn: ${vals.betOn}, amount: ${this.web3.utils.fromWei(vals.amount)}`);

    this.service.placeBet(vals.betOn, vals.amount)
      // .then(betEvent => {
      //   console.log('PlaceBetComponent.placeBet() result');
      //   console.log(betEvent);
      //   this.betResults.unshift(betEvent);
      // })
      .catch(err => {
        this.message = 'Error sending bet';
        console.log(err);
      }).finally(() => this.updateMaxBet());
  }

  onBetPlaced(e: BetPlacedEvent) {        
    if (!e.id) {
      return;
    }
    console.log('PlaceBetComponent > onBetPlaced');
    console.log(e);
    this.waitingForBetResults = true;
    this.message = "Bet Placed! Waiting for results..."
  }

  onBetResult(e: BetResultEvent) {    
    if (!e.id) {
      return;
    }
    console.log('PlaceBetComponent > onBetResult');
    console.log(e);
    this.waitingForBetResults = false;
    this.message = '';
    this.betResults.unshift(e);
  }

}
