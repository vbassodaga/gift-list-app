import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GiftListComponent } from './components/gift-list/gift-list.component';
import { GiftCardComponent } from './components/gift-card/gift-card.component';
import { UserRegisterComponent } from './components/user-register/user-register.component';
import { HomeComponent } from './components/home/home.component';
import { CountdownComponent } from './components/countdown/countdown.component';
import { SidebarMenuComponent } from './components/sidebar-menu/sidebar-menu.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { MyGiftsComponent } from './components/my-gifts/my-gifts.component';
import { AuthSelectComponent } from './components/auth-select/auth-select.component';
import { UserLoginComponent } from './components/user-login/user-login.component';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SidebarModule } from 'primeng/sidebar';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    GiftListComponent,
    GiftCardComponent,
    UserRegisterComponent,
    HomeComponent,
    CountdownComponent,
    SidebarMenuComponent,
    NavbarComponent,
    MyGiftsComponent,
    AuthSelectComponent,
    UserLoginComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputTextareaModule,
    ToastModule,
    TagModule,
    ConfirmDialogModule,
    SidebarModule
  ],
  providers: [MessageService, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }

