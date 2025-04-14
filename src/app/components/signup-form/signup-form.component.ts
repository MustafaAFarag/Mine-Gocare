import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormsModule,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RadioButtonModule,
    CheckboxModule,
    MessageModule,
  ],
  providers: [MessageService, AuthService],
})
export class SignupFormComponent implements OnInit {
  @Output() toggle = new EventEmitter<boolean>();
  signupForm!: FormGroup;
  loading = false;
  showPassword = false;
  selectedGender: number = 1; // Default to 'Men'

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.signupForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        identifier: ['', [Validators.required, this.emailOrPhoneValidator]],
        gender: [1, [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: this.passwordMatchValidator },
    );
  }

  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value?.trim();

    if (!value) return { required: true };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePatternWithZero = /^0\d{10}$/; // starts with 0, 11 digits
    const phonePatternWithoutZero = /^[1-9]\d{9}$/; // doesn't start with 0, 10 digits

    const isEmail = emailPattern.test(value);
    const isPhoneWithZero = phonePatternWithZero.test(value);
    const isPhoneWithoutZero = phonePatternWithoutZero.test(value);

    if (isEmail || isPhoneWithZero || isPhoneWithoutZero) {
      return null;
    }

    return { emailOrPhone: true };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSignupSubmit() {
    if (this.signupForm.invalid) {
      // Mark all controls as touched to show validation messages
      Object.keys(this.signupForm.controls).forEach((key) => {
        const control = this.signupForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formValue = this.signupForm.value;

    // Determine if the identifier is email or phone
    const isEmail = formValue.identifier.includes('@');

    const signupData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      emailAddress: isEmail ? formValue.identifier : null,
      mobileNumber: !isEmail ? formValue.identifier : null,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      countryCode: 'EG', // You might want to make this dynamic
      gender: formValue.gender,
    };

    console.log('Signup Data:', signupData);

    this.authService.signup(signupData).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account created successfully!',
        });
        this.router.navigate(['/product-details/1/2']);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to create account',
        });
        this.loading = false;
      },
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleMode() {
    this.toggle.emit(true);
  }

  // Getters for form controls
  get firstName() {
    return this.signupForm.get('firstName');
  }

  get lastName() {
    return this.signupForm.get('lastName');
  }

  get identifier() {
    return this.signupForm.get('identifier');
  }

  get password() {
    return this.signupForm.get('password');
  }

  get confirmPassword() {
    return this.signupForm.get('confirmPassword');
  }
}
