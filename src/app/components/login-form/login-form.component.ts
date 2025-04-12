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
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginFormComponent implements OnInit {
  @Output() toggle = new EventEmitter<boolean>();
  @Output() loginSuccess = new EventEmitter<void>();
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', [Validators.required]],
    });

    console.log('Login form initialized', this.loginForm);
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
    this.errorMessage = ''; // Clear any previous error messages
    const { identifier, password } = this.loginForm.value;

    this.authService.login(identifier, password).subscribe({
      next: (res) => {
        console.log('✅ Auth success:', res);
        this.loading = false;
        this.loginSuccess.emit();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err.message ||
          'Login failed. Please check your credentials and try again.';
        console.error('❌ Login error:', err);
      },
    });
  }

  toggleMode(): void {
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
