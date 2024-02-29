import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import ValidateForm from '../../helpers/validateForm';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';
import { UserStoreService } from '../../services/user-store.service';
import { ResetPasswordService } from '../../services/reset-password.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";
  loginForm!: FormGroup;
  public resetPasswordEmail!:string;
  public isValidEmail!:boolean;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private toast: NgToastService, private userstore:UserStoreService, private resetPasswordService:ResetPasswordService) { }
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]

    });

  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";

  }
  onLogin() {
    if (this.loginForm.valid) {
      //send object to database
      //console.log(this.loginForm.value);
      this.auth.login(this.loginForm.value).subscribe({
        next: (res) => {
          //alert(res.message);
          //this.toast.success({detail:"SUCCESS",summary:'Your Success Message', duration:'5000'});
          this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 5000 });
          this.loginForm.reset();
          //this.auth.storeToken(res.token);
          this.auth.storeToken(res.accessToken);
          this.auth.storeRefreshToken(res.refreshToken);
          const tokenPayload=this.auth.decodedToken();
          this.userstore.setFullNameForStore(tokenPayload.unique_name);
          this.userstore.setRoleForStore(tokenPayload.role);
          this.router.navigate(['dashboard']);
        },
        error: (err) => {
          //alert(err?.error.message);
          this.toast.error({ detail: "ERROR", summary: err?.error.message, duration: 5000 });
        }
      });

    }
    else {
      //display error messages.
      ValidateForm.validateAllFormFields(this.loginForm);

    }

  }

  checkValidEmail(event:string){
    const value=event;
    const pattern=/^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
    this.isValidEmail=pattern.test(value);
    return this.isValidEmail;
  }
  confirmToSend(){
    if(this.checkValidEmail(this.resetPasswordEmail)){
      console.log(this.resetPasswordEmail);
      //this.resetPasswordEmail="";
      const buttonRef=document.getElementById("closeBtn");
      buttonRef?.click();
      //API Call to be done
      this.resetPasswordService.sendResetPasswordLink(this.resetPasswordEmail).subscribe({
        next:(res)=>{
          this.toast.success({detail:"SUCCESS",summary:"An email has been sent to your e-mail with reset link!!",duration:5000});
          this.resetPasswordEmail="";
          const buttonRef=document.getElementById("closeBtn");
          buttonRef?.click();
        },
        error:(error)=>{
          this.toast.error({detail:"ERROR",summary:"Something went wrong!!!",duration:5000});
        }
      })
    }
  }

}
