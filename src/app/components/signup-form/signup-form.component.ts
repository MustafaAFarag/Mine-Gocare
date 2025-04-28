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
import { TranslateModule } from '@ngx-translate/core';

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
    TranslateModule,
  ],
  providers: [MessageService, AuthService],
})
export class SignupFormComponent implements OnInit {
  @Output() toggle = new EventEmitter<boolean>();
  @Output() signupSuccess = new EventEmitter<void>();
  signupForm!: FormGroup;
  loading = false;
  showPassword = false;
  selectedGender: number = 1; // Default to 'Men'

  // Added for phone input with flag
  isPhone: boolean = false;

  // Egypt flag SVG placeholder
  egyptFlagSvg: string = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 800 400">
      <rect width="800" height="133" fill="#CE1126"/>
      <rect width="800" height="133" y="133" fill="#FFFFFF"/>
      <rect width="800" height="133" y="266" fill="#000000"/>
      <path d="M400 110 l20 62h-66l53-38-20 62 53-38-20 62 53-38-20 62 53-38-20 62 53-38z" fill="#FFCC00"/>
    </svg>
  `;

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

    // Add listener to identifier field to detect if it's a phone number
    this.signupForm.get('identifier')?.valueChanges.subscribe((value) => {
      // Check if the input is numeric to determine if it's a phone number
      this.isPhone = value && /^\d+$/.test(value);
    });
  }

  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value?.trim();

    if (!value) return { required: true };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePatternWithZero = /^0\d{10}$/; // starts with 0, followed by 10 digits (total 11)
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

  // Method to limit phone input to 10 or 11 digits based on format
  onIdentifierInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only process if it's a numeric input (phone)
    if (/^\d*$/.test(value)) {
      // If it starts with 0, limit to 11 digits
      if (value.startsWith('0') && value.length > 11) {
        this.signupForm.get('identifier')?.setValue(value.slice(0, 11));
      }
      // If it doesn't start with 0, limit to 10 digits
      else if (!value.startsWith('0') && value.length > 10) {
        this.signupForm.get('identifier')?.setValue(value.slice(0, 10));
      }
    }
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

    // Process phone number if it's a phone
    let processedIdentifier = formValue.identifier;
    if (!isEmail && processedIdentifier.startsWith('0')) {
      // Remove the leading 0 for phone numbers that start with 0
      processedIdentifier = processedIdentifier.substring(1);
    }

    const signupData = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      emailAddress: isEmail ? formValue.identifier : null,
      mobileNumber: !isEmail ? processedIdentifier : null,
      password: formValue.password,
      confirmPassword: formValue.confirmPassword,
      countryCode: 'EG',
      gender: formValue.gender,
    };

    this.authService.signup(signupData).subscribe({
      next: () => {
        this.loading = false;
        // First emit the success event to trigger the toast
        this.signupSuccess.emit();
        // Then reset the form
        this.signupForm.reset();
        // Finally emit the toggle event to switch to login mode
        setTimeout(() => {
          this.toggle.emit();
        }, 0);
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
    this.toggle.emit(); // Changed to emit without parameter
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
