import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { NgToastService } from 'ng-angular-popup';
import { Router } from '@angular/router';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  var auth=inject(AuthService);
  const myToken=auth.getToken();
  //console.log("at interceptor pavan");
  const authReq=req.clone({
    headers:req.headers.set('Authorization',`Bearer ${myToken}`)
  })
  return next(authReq);
};
