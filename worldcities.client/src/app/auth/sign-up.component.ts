import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';
import { BaseFormComponent } from '../base-form.component';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss'
})
export class SignUpComponent extends BaseFormComponent implements OnInit  {

  loginResult?: LoginResult;
  hide1: boolean = true;
  hide2: boolean = true;
  constructor(private authService: AuthService, private router: Router, private _snackBar: MatSnackBar) {
    super();
  }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      password2: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    var loginRequest = <LoginRequest>{};
    loginRequest.email = this.form.controls['email'].value;
    loginRequest.password = this.form.controls['password'].value;

    this.authService.signup(loginRequest).subscribe({
      next: (result) => {
        console.log(result);
        this.loginResult = result;
        this._snackBar.open('Account created successfully.', 'Close', { duration: 3000 });
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.log(error);
        this.loginResult = error;
      }
    })
  }

}
