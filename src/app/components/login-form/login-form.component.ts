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

interface Country {
  name: string;
  code: string;
  phoneCode: string;
  phoneCodeCountryId: number;
  flag: string;
}

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
  showCountryDropdown = false;
  isPhone = false;

  countries: Country[] = [
    {
      name: 'common.egypt',
      code: 'EG',
      phoneCode: '+20',
      phoneCodeCountryId: 224,
      flag: 'assets/images/egypt-flag-icon.svg',
    },
    {
      name: 'common.saudiArabia',
      code: 'SA',
      phoneCode: '+966',
      phoneCodeCountryId: 103,
      flag: 'assets/images/settings/saudi-flag.svg',
    },
  ];
  selectedCountry: Country = this.countries[0]; // Default to Egypt

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
  ) {}

  getLanguage(): string {
    if (typeof window !== 'undefined') {
      const lang = localStorage.getItem('language') || 'en';
      console.log('Current language:', lang);
      return lang;
    }
    return 'en';
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identifier: ['', [Validators.required, this.emailOrPhoneValidator]],
      password: ['', [Validators.required]],
    });

    // Add listener to identifier field to detect if it's a phone number
    this.loginForm.get('identifier')?.valueChanges.subscribe((value) => {
      // Check if the input is numeric to determine if it's a phone number
      this.isPhone = value && /^\d+$/.test(value);
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

    // Determine if the identifier is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue.identifier);
    console.log('Is Email:', isEmail);
    console.log('Identifier:', formValue.identifier);

    // Process phone number if it's a phone
    let processedIdentifier = formValue.identifier;
    if (!isEmail && processedIdentifier.startsWith('0')) {
      // Remove the leading 0 for phone numbers that start with 0
      processedIdentifier = processedIdentifier.substring(1);
    }

    this.authService
      .login(
        processedIdentifier,
        formValue.password,
        isEmail ? undefined : this.selectedCountry,
      )
      .subscribe({
        next: (res) => {
          this.loading = false;
          this.loginForm.reset();
          // Only show congrats modal if user just registered
          if (localStorage.getItem('showCongratsOnLogin') === 'true') {
            this.showCongratsModal = true;
            localStorage.removeItem('showCongratsOnLogin'); // Remove the flag after showing
          } else {
            this.loginSuccess.emit();
          }
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

    // Phone patterns for Egypt and Saudi Arabia
    const egyptPatternWithZero = /^0\d{10}$/; // starts with 0, followed by 10 digits (total 11)
    const egyptPatternWithoutZero = /^[1-9]\d{9}$/; // doesn't start with 0, 10 digits
    const saudiPattern = /^[5-9]\d{8}$/; // 9 digits starting with 5-9

    const isEmail = emailPattern.test(value);
    const isEgyptWithZero = egyptPatternWithZero.test(value);
    const isEgyptWithoutZero = egyptPatternWithoutZero.test(value);
    const isSaudi = saudiPattern.test(value);

    if (isEmail || isEgyptWithZero || isEgyptWithoutZero || isSaudi) {
      return null;
    }

    return { emailOrPhone: true };
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
