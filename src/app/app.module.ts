import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { PlaceBetComponent } from './place-bet/place-bet.component';
import { CoinFlipBetService } from './coin-flip-bet.service';

@NgModule({
  declarations: [
    AppComponent,
    PlaceBetComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule
  ],
  providers: [CoinFlipBetService],
  bootstrap: [AppComponent]
})
export class AppModule { }
