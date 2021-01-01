import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router

import { PlaceBetComponent } from './place-bet/place-bet.component';
import { WalletComponent } from './wallet/wallet.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';

const routes: Routes = [
    { path: '', component: PlaceBetComponent },
    {
        path: 'wallet',
        component: WalletComponent,
        children: [
            { path: 'deposit', component: DepositComponent },
            { path: 'withdraw', component: WithdrawComponent }
        ]
    }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }