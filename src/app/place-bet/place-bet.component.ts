import BN from 'bn.js';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder, FormGroup } from '@angular/forms';
import { CoinFlipBetService } from '../coin-flip-bet.service.js';

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

  constructor(private service: CoinFlipBetService, private fb: FormBuilder) { }

  ngOnInit() {
    this.service.minBet().then(b => this.minBet = b);
    this.service.maxBet().then(b => this.maxBet = b);

    this.betForm = this.fb.group({
      betOn: [''],
      betAmount: ['']
    });
  }

  placeBet() {
    this.message = '';
    let vals = {
      betOn: this.betForm.value.betOn,
      amount: new BN(this.betForm.value.betAmount)
    };
    console.log(`Place Bet clicked. betOn: ${vals.betOn}, amount: ${vals.amount}`);

    this.service.placeBet(vals.betOn, vals.amount)
      .then(r => {
        this.message = `Flip Result: ${r.flipResult ? 'Heads' : 'Tails'}, Payout: ${r.payout.toString(10)}`;
      }).catch(err => {
        this.message = 'Error sending bet';
      });
  }

}
