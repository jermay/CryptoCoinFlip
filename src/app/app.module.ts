import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { PlaceBetComponent } from './place-bet/place-bet.component';
import { CoinFlipBetService } from './coin-flip-bet.service';
import { BetEventComponent } from './bet-event/bet-event.component';
import { WalletComponent } from './wallet/wallet.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { ContractService } from './contract.service';

@NgModule({
  declarations: [
    AppComponent,
    PlaceBetComponent,
    BetEventComponent,
    WalletComponent,
    DepositComponent,
    WithdrawComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [ContractService, CoinFlipBetService],
  bootstrap: [AppComponent]
})
export class AppModule { }
