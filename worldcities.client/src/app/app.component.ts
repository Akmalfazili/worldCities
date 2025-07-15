import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
 
  title = 'worldcities.client';

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.init();
  } //this will allow authStatus subscribers t be notified of token presence when the app starts up. this will allow NavMenu component to show a Login/Logout link according to user status
}
