import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    MessageModule,
  ],
  providers: [MessageService],
})
export class SignupFormComponent {
  @Output() switch = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  signupForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      emailAddress: ['', [Validators.required, Validators.email]],
      phoneCode: ['+1'],
      mobileNumber: [0, Validators.required],
      countryCode: ['US'],
      deviceToken: ['browser-uuid'],
      isEmailConfirmed: [true],
      isPhoneConfirmed: [true],
      isAutomaticSignIn: [true],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      gender: [0],
      profileImageUrl: [''],
      thumbImageUrl: [''],
    });
  }

  signup() {
    if (this.signupForm.invalid) return;

    this.loading = true;
    this.authService.signup(this.signupForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.closeModal.emit();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Signup successful',
        });
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.message || 'Signup failed';
      },
    });
  }
}
