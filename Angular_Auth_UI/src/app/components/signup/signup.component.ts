import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import ValidateForm from '../../helpers/validateForm';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgToastService } from 'ng-angular-popup';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  type: string = "password";
  isText: boolean = false;
  eyeIcon: string = "fa-eye-slash";

  signupForm!: FormGroup;

  constructor(private fb: FormBuilder, private auth:AuthService, private router:Router, private toast:NgToastService) { }

  ngOnInit(): void {
    this.signupForm = this.fb.group({
      firstname: ['', Validators.required],
      lastname: ['', Validators.required],
      email: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  hideShowPass() {
    this.isText = !this.isText;
    this.isText ? this.eyeIcon = "fa-eye" : this.eyeIcon = "fa-eye-slash";
    this.isText ? this.type = "text" : this.type = "password";

  }
  onSignup() {
    if (this.signupForm.valid) {
      //send object to database
      //console.log(this.signupForm.value);
      this.auth.signUp(this.signupForm.value).subscribe({
        next:(res)=>{
          //alert(res.message);
          this.toast.success({ detail: "SUCCESS", summary: res.message, duration: 5000 });
          this.signupForm.reset();
          this.router.navigate(['login']);
        },
        error:(err)=>{
          //alert(err?.error.message);
          this.toast.error({ detail: "ERROR", summary: err?.error.message, duration: 5000 });
        }
      });

    }
    else {
      //display error messages.
      ValidateForm.validateAllFormFields(this.signupForm);

    }

  }

}
