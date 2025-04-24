import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CreateAddress } from '../../model/Address';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-address-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './address-form-modal.component.html',
  styleUrls: ['./address-form-modal.component.css'],
})
export class AddressFormModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveAddress = new EventEmitter<CreateAddress>();

  addressForm: FormGroup;
  addressTypes = [
    { id: 1, labelKey: 'Home' },
    { id: 2, labelKey: 'Work' },
    { id: 3, labelKey: 'Other' },
  ];

  private langSubscription: Subscription = new Subscription();
  currentLang: string = 'en';

  constructor(
    private fb: FormBuilder,
    private languageService: LanguageService,
  ) {
    this.addressForm = this.fb.group({
      fullName: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      countryId: [224, Validators.required], // Default to some value, can be changed
      districtId: [null, Validators.required],
      cityId: [null, Validators.required],
      address: ['', Validators.required],
      mapAddress: [''],
      latitude: ['0'],
      longitude: ['0'],
      type: [1, Validators.required], // Default to Home
      isDefault: [false],
      isPhoneVerified: [true], // Assuming phone verification happens elsewhere
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.langSubscription = this.languageService.language$.subscribe((lang) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onClose(): void {
    this.close.emit();
    this.addressForm.reset({
      countryId: 224,
      type: 1,
      isDefault: false,
      isPhoneVerified: true,
      latitude: '0',
      longitude: '0',
    });
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      this.saveAddress.emit(this.addressForm.value as CreateAddress);
      this.onClose();
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.addressForm.controls).forEach((key) => {
        const control = this.addressForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  getAddressTypeLabel(type: { id: number; labelKey: string }): string {
    return `address.types.${type.labelKey.toLowerCase()}`;
  }
}
