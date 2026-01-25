import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { GiftListComponent } from './components/gift-list/gift-list.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { UserLoginComponent } from './components/user-login/user-login.component';
import { AuthSelectComponent } from './components/auth-select/auth-select.component';
import { MyGiftsComponent } from './components/my-gifts/my-gifts.component';
import { CartComponent } from './components/cart/cart.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthSelectComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'register', component: UserRegisterComponent },
  { path: 'gifts', component: GiftListComponent },
  { path: 'my-gifts', component: MyGiftsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'users', component: UserManagementComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

