import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProductsComponent } from './components/products/products.component';
import { CartComponent } from './components/cart/cart.component';

const routes: Routes = [
  {path:'',redirectTo:'login',pathMatch:'full'},
  {path:'login', component:LoginComponent},
  {path:'signup', component:SignupComponent},  
  {path:'reset',component:ResetPasswordComponent},
  {path:'dashboard', component:DashboardComponent, canActivate:[authGuard]},
  {path:'products', component:ProductsComponent},
  {path:'cart', component:CartComponent}
  // {path:'dashboard', loadComponent:()=>import('./components/dashboard/dashboard.component').then((a)=>a.DashboardComponent), canActivate:[authGuard]},
  // {path:'products', loadComponent:()=>import('./components/products/products.component').then((a)=>a.ProductsComponent)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
