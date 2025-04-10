import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { LoginFormComponent } from '../login-form/login-form.component';
import { CommonModule } from '@angular/common';
import { SignupFormComponent } from '../signup-form/signup-form.component';

@Component({
  selector: 'app-auth-modal',
  imports: [
    DialogModule,
    LoginFormComponent,
    CommonModule,
    SignupFormComponent,
  ],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  isLoginMode: boolean = true;

  // Toggle between login and signup forms
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }
  closeDialog() {
    this.visibleChange.emit(false);
  }
}
