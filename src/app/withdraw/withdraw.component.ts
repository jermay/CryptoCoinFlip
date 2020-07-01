import BN from 'bn.js';

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CoinFlipBetService } from '../coin-flip-bet.service';
import { Web3Service } from '../web3.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.css']
})
export class WithdrawComponent implements OnInit {

  isOwner: boolean = false;
  withdrawForm: FormGroup;

  constructor(private service: CoinFlipBetService, private web3: Web3Service, private fb: FormBuilder) { }

  ngOnInit() {
    this.withdrawForm = this.fb.group({
      amount: ['']
    });
    this.service.getBalance();
  }

  withdrawMax() {
    this.service.withdraw(this.service.balance);
  }

  withdraw() {
    const ethAmount = this.withdrawForm.value.amount.toString();
    const weiAmount = this.web3.instance.utils.toWei(ethAmount, 'ether');
    console.log(this.withdrawForm.value);
    console.log(`Withdraw: ${ethAmount} ETH (${weiAmount})`);

    this.service.withdraw(weiAmount)
      .then(() => this.withdrawForm.setValue({ amount: '' }));
  }

}
