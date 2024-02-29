import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgToastService } from 'ng-angular-popup';

@Injectable({
  providedIn: 'root'
})
class PermissionsService {

  constructor(private router: Router,private auth:AuthService, private toast:NgToastService) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
      //your logic goes here
      if(this.auth.isLoggedIn()){
        return true;
      }
      else{
        this.toast.error({detail:"ERROR", summary:"Please login first!!!", duration:5000});
        this.router.navigate(['login']);
        return false;
      }
  }
}

export const authGuard: CanActivateFn = (route, state) => {
  return inject(PermissionsService).canActivate(route, state);
};


