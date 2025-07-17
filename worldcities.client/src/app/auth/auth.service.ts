import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

import { environment } from './../../environments/environment';
import { LoginResult } from './login-result';
import { LoginRequest } from './login-request';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    protected http: HttpClient) {
  }

  private tokenKey: string = "token";

  private _authstatus = new BehaviorSubject<boolean>(false);
  public authStatus = this._authstatus.asObservable();

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  init(): void {
    if (this.isAuthenticated())
      this.setAuthStatus(true);
  }

  login(item: LoginRequest): Observable<LoginResult> {
    var url = environment.baseUrl + "api/Account/Login";
    return this.http.post<LoginResult>(url, item).pipe(tap(loginResult => {
      //console.log(loginResult);
      if (loginResult.success && loginResult.token) {
        localStorage.setItem(this.tokenKey, loginResult.token);
        this.setAuthStatus(true);
      }
    }));
  }
  private setAuthStatus(isAuthenticated: boolean): void {
    this._authstatus.next(isAuthenticated);
  }
  logout() {
    localStorage.removeItem(this.tokenKey);
    this.setAuthStatus(false);
  }
  signup(item: LoginRequest): Observable<LoginResult> {
    var url = environment.baseUrl + "api/Account/SignUp";
    return this.http.post<LoginResult>(url, item);
  }
}
