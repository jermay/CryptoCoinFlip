import BN from 'bn.js';
import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider);

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CoinFlipBetService } from '../coin-flip-bet.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {

  depositForm: FormGroup;

  constructor(private service: CoinFlipBetService, private fb: FormBuilder) { }

  ngOnInit() {
    this.depositForm = this.fb.group({
      amount: ['']
    });
  }
  
  deposit() {
    const ethAmount = this.depositForm.value.amount.toString();
    const weiAmount = web3.utils.toWei(ethAmount, 'ether');
    console.log(this.depositForm.value);
    console.log(`Deposit: ${ethAmount} ETH (${weiAmount})`);

    this.service.deposit(weiAmount)
      .then(() => this.depositForm.setValue({amount: ''}));
  }

}
