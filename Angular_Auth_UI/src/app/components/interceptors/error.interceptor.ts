import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { TokenApiModel } from '../../models/token-api-model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {  
  var toast=inject(NgToastService);
  var router=inject(Router);
  var auth=inject(AuthService);


  return next(req).pipe(catchError((error:any)=>{
    if(error instanceof HttpErrorResponse){
      if(error.status===401){        
        let tokenapimodel= new TokenApiModel();
        tokenapimodel.accessToken=auth.getToken()!;
        tokenapimodel.refreshToken=auth.getRefreshToken()!;
        return auth.renewToken(tokenapimodel).pipe(
          switchMap((data:TokenApiModel)=>{
            auth.storeRefreshToken(data.refreshToken);
            auth.storeToken(data.accessToken);
            req=req.clone({
              headers:req.headers.set('Authorization',`Bearer ${data.accessToken}`)
            })
            return next(req);
          }),
          catchError((err)=>{
            return throwError(()=>{
              toast.warning({detail:"WARNING", summary:"Token is expired, Please Login again!!!"});
              router.navigate(["login"]);

            })
          })
        );
        
      }
    }
    return throwError(()=>error);
  }));


};
