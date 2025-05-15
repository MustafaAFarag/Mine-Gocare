import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { CongratsModalComponent } from '../congrats-modal/congrats-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login-form',
  standalone: true,
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CongratsModalComponent,
  ],
})
export class LoginFormComponent implements OnInit {
  @Output() toggle = new EventEmitter<boolean>();
  @Output() loginSuccess = new EventEmitter<void>();
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;
  showCongratsModal = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', [Validators.required]],
    });
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      // Mark all controls as touched to show validation messages
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formValue = this.loginForm.value;

    this.authService.login(formValue.identifier, formValue.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.loginForm.reset();
        this.loginSuccess.emit();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Invalid credentials';
      },
    });
  }

  handleCongratsModalClose() {
    this.showCongratsModal = false;
    this.loginForm.reset();
    this.loginSuccess.emit();
  }

  toggleMode(): void {
    this.loginForm.reset();
    this.toggle.emit(false);
  }

  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return { required: true };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10,15}$/;

    const isEmail = emailPattern.test(value);
    const isPhone = phonePattern.test(value);

    if (!isEmail && !isPhone) {
      return { emailOrPhone: true };
    }

    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get identifier() {
    return this.loginForm.get('identifier');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
