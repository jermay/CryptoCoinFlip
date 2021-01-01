/*import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceBetComponent } from './place-bet.component';
import { CoinFlipBetService } from '../coin-flip-bet.service';
import { FormBuilder } from '@angular/forms';

import { Contract } from 'web3-eth-contract';
import { Injectable } from '@angular/core';
import { BetEvent } from '../bet-event';
import BN from 'bn.js';

@Injectable({
  providedIn: 'root'
})
export class CoinFlipBetServiceStub {

  private readonly contractAddress = '0xDf7d6a80e938ecA5a30E73AC108449126db2A70A';
  private contract: Promise<Contract>;


  private getContract(): Promise<Contract> {
    return Promise.resolve(undefined);
  }

  minBet(): Promise<BN> {
    return Promise.resolve(new BN('0'));
  }

  maxBet(): Promise<BN> {
    return Promise.resolve(new BN('0'));
  }

  placeBet(betOn: boolean, amount: BN): Promise<BetEvent> {
    return Promise.resolve({
      id: new BN('0'),
      player: '',
      amount: new BN('0'),
      betOn: false,
      flipResult: false,
      payout: new BN('0')
    });
  }
}


describe('PlaceBetComponent', () => {
  let component: PlaceBetComponent;
  let fixture: ComponentFixture<PlaceBetComponent>;
  let betServiceSpy: jasmine.Spy;

  beforeEach(async(() => {    
    TestBed.configureTestingModule({
      declarations: [PlaceBetComponent],
      providers: [
        FormBuilder,
        { provide: CoinFlipBetService, useClass: CoinFlipBetServiceStub }
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaceBetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
*/