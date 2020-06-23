import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { CoinFlipBetService } from '../coin-flip-bet.service';
import { Web3Service } from '../web3.service';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.css']
})
export class DepositComponent implements OnInit {

  depositForm: FormGroup;

  constructor(private service: CoinFlipBetService, private web3: Web3Service, private fb: FormBuilder) { }

  ngOnInit() {
    this.depositForm = this.fb.group({
      amount: ['']
    });
  }
  
  deposit() {
    const ethAmount = this.depositForm.value.amount.toString();
    const weiAmount = this.web3.instance.utils.toWei(ethAmount, 'ether');
    console.log(this.depositForm.value);
    console.log(`Deposit: ${ethAmount} ETH (${weiAmount})`);

    this.service.deposit(weiAmount)
      .then(() => this.depositForm.setValue({amount: ''}));
  }

}
