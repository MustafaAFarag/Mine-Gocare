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
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageModule } from 'primeng/message';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PointingSystemService } from '../../services/pointing-system.service';
import { AuthModalService } from '../../auth-modal.service';
import { filter, take } from 'rxjs/operators';

interface Country {
  name: string;
  code: string;
  phoneCode: string;
  phoneCodeCountryId: number;
  flag: string;
}

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
    RouterModule,
  ],
  providers: [AuthService],
})
export class SignupFormComponent implements OnInit {
  @Output() toggle = new EventEmitter<boolean>();
  @Output() signupSuccess = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  signupForm!: FormGroup;
  loading = false;
  showPassword = false;
  selectedGender: number = 1; // Default to 'Men'
  errorMessage = ''; // Add error message property
  showCountryDropdown = false;

  // Added for phone input with flag
  isPhone: boolean = false;

  countries: Country[] = [
    {
      name: 'Egypt',
      code: 'EG',
      phoneCode: '+20',
      phoneCodeCountryId: 224,
      flag: 'assets/images/egypt-flag-icon.svg',
    },
    {
      name: 'Saudi Arabia',
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
    private pointingSystemService: PointingSystemService,
    private router: Router,
    private authModalService: AuthModalService,
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
    this.signupForm = this.fb.group(
      {
        firstName: ['', [Validators.required, this.nameValidator]],
        lastName: ['', [Validators.required, this.nameValidator]],
        identifier: ['', [Validators.required, this.emailOrPhoneValidator]],
        gender: [1, [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        acceptTerms: [false, [Validators.requiredTrue]],
      },
      { validator: this.passwordMatchValidator },
    );

    // Add listener to identifier field to detect if it's a phone number
    this.signupForm.get('identifier')?.valueChanges.subscribe((value) => {
      // Check if the input is numeric to determine if it's a phone number
      this.isPhone = value && /^\d+$/.test(value);
    });
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.trim();
    if (!value) return { required: true };

    // Check if name contains any numbers
    if (/\d/.test(value)) {
      return { containsNumbers: true };
    }

    return null;
  }

  emailOrPhoneValidator(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value?.trim();

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

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  // Method to limit phone input based on selected country
  onIdentifierInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only process if it's a numeric input (phone)
    if (/^\d*$/.test(value)) {
      if (this.selectedCountry.code === 'EG') {
        // If it starts with 0, limit to 11 digits
        if (value.startsWith('0') && value.length > 11) {
          this.signupForm.get('identifier')?.setValue(value.slice(0, 11));
        }
        // If it doesn't start with 0, limit to 10 digits
        else if (!value.startsWith('0') && value.length > 10) {
          this.signupForm.get('identifier')?.setValue(value.slice(0, 10));
        }
      } else if (this.selectedCountry.code === 'SA') {
        // Saudi numbers are 9 digits starting with 5-9
        if (value.length > 9) {
          this.signupForm.get('identifier')?.setValue(value.slice(0, 9));
        }
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

      // Check for password mismatch
      const password = this.signupForm.get('password')?.value;
      const confirmPassword = this.signupForm.get('confirmPassword')?.value;

      if (password !== confirmPassword) {
        this.signupForm.setErrors({ passwordMismatch: true });
        this.signupForm
          .get('confirmPassword')
          ?.setErrors({ passwordMismatch: true });
      }

      return;
    }

    this.loading = true;
    this.errorMessage = ''; // Clear any previous error message
    const formValue = this.signupForm.value;

    // Determine if the identifier is email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValue.identifier);
    let processedIdentifier = formValue.identifier;
    if (!isEmail && processedIdentifier.startsWith('0')) {
      processedIdentifier = processedIdentifier.substring(1);
    }

    let signupData;
    if (isEmail) {
      signupData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        emailAddress: formValue.identifier,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        countryCode: 'EG',
        gender: formValue.gender,
      };
    } else {
      signupData = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        mobileNumber: processedIdentifier,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        countryCode: this.selectedCountry.code,
        gender: formValue.gender,
        phoneCode: this.selectedCountry.phoneCode,
        PhoneCodeCountryId: this.selectedCountry.phoneCodeCountryId,
      };
    }

    this.authService.signup(signupData).subscribe({
      next: (res) => {
        // After successful signup, automatically log in the user
        const loginIdentifier = isEmail
          ? formValue.identifier
          : processedIdentifier;
        this.authService
          .login(
            loginIdentifier,
            formValue.password,
            isEmail ? undefined : this.selectedCountry,
          )
          .subscribe({
            next: (loginRes) => {
              // Add registration points
              const token = localStorage.getItem('accessToken');
              if (token) {
                this.pointingSystemService
                  .addPoints(token, 1, false)
                  .subscribe({
                    next: (pointsRes) =>
                      console.log(
                        'SignupFormComponent: Points added successfully:',
                        pointsRes,
                      ),
                    error: (pointsErr) =>
                      console.error(
                        'SignupFormComponent: Error adding points:',
                        pointsErr,
                      ),
                  });
              }

              // Reset form
              this.signupForm.reset();
              this.loading = false;

              // Close the auth modal first
              this.authModalService.hideModal();

              // Wait for user state to be set in AuthService, then navigate
              this.authService.user$
                .pipe(
                  filter((user) => !!user), // Wait for user to be truthy
                  take(1), // Take only the first emission that passes the filter
                )
                .subscribe(() => {
                  // Add a small delay to ensure all localStorage operations are complete
                  setTimeout(() => {
                    this.router.navigate(['/account/points']).then(() => {
                      // Show congrats modal after successful navigation
                      setTimeout(() => {
                        this.authModalService.showCongratsModal();
                      }, 100);
                    });
                  }, 150); // Small delay to ensure token is stored
                });
            },
            error: (loginErr) => {
              this.loading = false;
              this.errorMessage =
                'Account created but failed to log in automatically. Please try logging in manually.';
            },
          });
      },
      error: (error) => {
        this.loading = false;
        if (error.error?.message?.includes('already in use')) {
          this.errorMessage = 'Mobile Number/Email is already in use';
        } else {
          this.errorMessage =
            error.error?.message || 'An error occurred during registration';
        }
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

  get acceptTerms() {
    return this.signupForm.get('acceptTerms');
  }

  handleTermsClick(event: Event) {
    event.preventDefault();
    this.authModalService.hideModal();
    this.router.navigate(['/terms-and-conditions']);
  }
}
