import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-form',
  standalone: true,
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  imports: [CommonModule, FormsModule],
  providers: [],
})
export class LoginFormComponent {
  @Output() toggle = new EventEmitter<boolean>();

  loginObject = {
    email: '',
    password: '',
  };

  constructor(private router: Router) {}

  onLoginSubmit() {
    console.log('Login form submitted:', this.loginObject);
  }

  // Emit the toggle event to switch to the signup form
  toggleMode() {
    this.toggle.emit(false);
  }
}
