import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { LoginFormComponent } from '../login-form/login-form.component';
import { CommonModule } from '@angular/common';
import { SignupFormComponent } from '../signup-form/signup-form.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-auth-modal',
  imports: [
    DialogModule,
    LoginFormComponent,
    CommonModule,
    SignupFormComponent,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './auth-modal.component.html',
  styleUrl: './auth-modal.component.css',
})
export class AuthModalComponent {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  isLoginMode: boolean = true;

  constructor(private messageService: MessageService) {}

  // Toggle between login and signup forms
  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  closeDialog() {
    this.visibleChange.emit(false);
  }

  handleLoginSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Login successful!',
    });
    this.closeDialog();
  }

  handleLoginError(error: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: error,
    });
  }
}
