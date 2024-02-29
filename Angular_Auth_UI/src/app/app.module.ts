import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { NgToastModule } from 'ng-angular-popup';
import { tokenInterceptor } from './components/interceptors/token.interceptor';
import { errorInterceptor } from './components/interceptors/error.interceptor';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProductsComponent } from './components/products/products.component';
import { ProductCardComponent } from './shared/components/product-card/product-card.component';
import { CartComponent } from './components/cart/cart.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    ResetPasswordComponent,
    ProductsComponent,
    ProductCardComponent,
    CartComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgToastModule
  ],
  providers: [
    provideHttpClient(withInterceptors([
      tokenInterceptor,
      errorInterceptor
    ]))
  ],
  // providers: [{
  //   provide:HTTP_INTERCEPTORS,
  //   useClass:tokenInterceptor,
  //   multi:true
  // }],
  bootstrap: [AppComponent]
})
export class AppModule { }
