import BN from 'bn.js';
import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider);

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CoinFlipBetService } from '../coin-flip-bet.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit {

  readonly web3 = new Web3(Web3.givenProvider);
  withdrawForm: FormGroup;
  
  constructor(private service: CoinFlipBetService, private fb: FormBuilder) { }

  ngOnInit() {
    this.withdrawForm = this.fb.group({
      amount: ['']
    });
    this.service.getBalance()
  }

  withdrawMax() {
    this.service.withdraw(this.service.balance);
  }
  
  withdraw() {
    const ethAmount = this.withdrawForm.value.amount.toString();
    const weiAmount = web3.utils.toWei(ethAmount, 'ether');
    console.log(this.withdrawForm.value);
    console.log(`Withdraw: ${ethAmount} ETH (${weiAmount})`);

    this.service.withdraw(weiAmount)
      .then(() => this.withdrawForm.setValue({amount: ''}));
  }

}
