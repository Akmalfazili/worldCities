import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
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
      password: new FormControl('', [Validators.required, this.validatePasswordStrength]),
      password2: new FormControl('', [Validators.required, this.validateSamePassword])
    });
  }
  private validateSamePassword(control: AbstractControl): ValidationErrors | null {
    const password = control.parent?.get('password');
    const confirmPassword = control.parent?.get('password2');
    return password?.value == confirmPassword?.value ? null : { 'notSame': true };
  }
  private validatePasswordStrength(control: AbstractControl): ValidationErrors | null {
    const password = control.parent?.get('password');

    const errors: ValidationErrors = {};

    if (password?.value.length < 8) {
      errors['minLength'] = true;
    }
    if (!/[A-Z]/.test(password?.value)) {
      errors['uppercase'] = true;
    }
    if (!/[a-z]/.test(password?.value)) {
      errors['lowercase'] = true;
    }
    if (!/[0-9]/.test(password?.value)) {
      errors['digit'] = true;
    }
    if (!/[^a-zA-Z0-9]/.test(password?.value)) {
      errors['specialChar'] = true;
    }
    return Object.keys(errors).length ? errors : null;

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
