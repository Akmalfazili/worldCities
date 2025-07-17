import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';

import { BaseFormComponent } from '../base-form.component';
import { AuthService } from './auth.service';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent extends BaseFormComponent implements OnInit {
  title?: string;
  loginResult?: LoginResult;
  returnUrl: string = '/';
  isLoggedIn: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, private router: Router, private authService: AuthService) {
    super();
    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl') || '/';
  }
  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }
  onSubmit() {
    var loginRequest = <LoginRequest>{};
    loginRequest.email = this.form.controls['email'].value;
    loginRequest.password = this.form.controls['password'].value;

    this.authService.login(loginRequest).subscribe({
      next: (result) => {
        console.log(result);
        this.loginResult = result;
        this.router.navigateByUrl(this.returnUrl); //re-navigate to previously unauthorised page
        //this.router.navigate(['/']);
      },
      error: (error) => {
        console.log(error);
        if (error.status == 401) {
          this.loginResult = error.error;
        }
      }
    });
  }
}
