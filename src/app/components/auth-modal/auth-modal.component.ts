import { Component, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { LoginFormComponent } from '../login-form/login-form.component';
import { SignupFormComponent } from '../signup-form/signup-form.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-modal',
  imports: [
    DialogModule,
    LoginFormComponent,
    SignupFormComponent,
    CommonModule,
  ],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css'],
})
export class AuthModalComponent {
  @Input() visible = false;
  isLoginMode = true;

  constructor(public authService: AuthService) {}

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  close() {
    this.visible = false;
  }
}
