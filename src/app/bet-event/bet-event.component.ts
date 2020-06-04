import Web3 from 'web3';
import { Component, OnInit, Input } from '@angular/core';
import { BetResultEvent } from '../bet-result-event';

@Component({
  selector: 'app-bet-event',
  templateUrl: './bet-event.component.html',
  styleUrls: ['./bet-event.component.css']
})
export class BetEventComponent implements OnInit {

  @Input("betResult") betResult: BetResultEvent;

  readonly web3 = new Web3(Web3.givenProvider);

  constructor() { }

  ngOnInit() {
  }

}
