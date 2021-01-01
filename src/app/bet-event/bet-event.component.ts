import { Component, OnInit, Input } from '@angular/core';

import { Web3Service } from '../web3.service';
import { Bet, BetStatus } from '../bet';

@Component({
  selector: 'app-bet-event',
  templateUrl: './bet-event.component.html',
  styleUrls: ['./bet-event.component.css']
})
export class BetEventComponent implements OnInit {

  @Input("bet") bet: Bet;  
  readonly BetStatus = BetStatus; //enum proxy

  constructor(private web3: Web3Service) { }

  ngOnInit() {
    // console.log('BetEventComponent: bet: ', this.bet);
  }

}
