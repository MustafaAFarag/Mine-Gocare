import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-bank-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './bank-details.component.html',
  styleUrls: ['./bank-details.component.css'],
})
export class BankDetailsComponent {
  bankDetailsForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.bankDetailsForm = this.fb.group({
      bankAccountNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      holderName: ['', Validators.required],
      swift: ['', Validators.required],
      ifsc: ['', Validators.required],
      paypalEmail: ['', [Validators.required, Validators.email]],
    });
  }

  // This is just a placeholder - no actual logic as requested
  onSubmit() {
    console.log('Form submitted', this.bankDetailsForm.value);
  }
}
