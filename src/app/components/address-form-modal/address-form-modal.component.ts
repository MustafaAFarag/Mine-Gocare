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
import { CreateAddress, City, Country, District } from '../../model/Address';
import { AddressService } from '../../services/address.service';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

type Language = 'en' | 'ar';

@Component({
  selector: 'app-address-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './address-form-modal.component.html',
  styleUrls: ['./address-form-modal.component.css'],
})
export class AddressFormModalComponent implements OnInit {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() saveAddress = new EventEmitter<CreateAddress>();

  addressForm: FormGroup;
  cities: City[] = [];
  districts: District[] = [];
  countries: Country[] = [];
  currentLang: Language = 'en';

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private translateService: TranslateService,
  ) {
    this.addressForm = this.createAddressForm();

    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  ngOnInit(): void {
    this.fetchAllCountriesAPI();
    this.setupFormListeners();

    // Subscribe to language changes
  }

  createAddressForm(): FormGroup {
    return this.fb.group({
      countryId: [null, Validators.required],
      cityId: [{ value: null, disabled: true }, Validators.required],
      districtId: [{ value: null, disabled: true }, Validators.required],
      latitude: [''],
      longitude: [''],
      address: ['', Validators.required],
      mapAddress: [''],
      phoneNumber: ['', Validators.required],
      isDefault: [false],
      type: [0],
      fullName: ['', Validators.required],
      isPhoneVerified: [false],
    });
  }

  setupFormListeners(): void {
    // Add listeners for country and city changes
    this.addressForm.get('countryId')?.valueChanges.subscribe((countryId) => {
      if (countryId) {
        this.fetchAllCitiesAPI(countryId);
        this.addressForm.get('cityId')?.enable();
        // Reset city and district when country changes
        this.addressForm.patchValue({
          cityId: null,
          districtId: null,
        });
        this.districts = [];
      }
    });

    this.addressForm.get('cityId')?.valueChanges.subscribe((cityId) => {
      if (cityId) {
        this.fetchAllDistrictsAPI(cityId);
        this.addressForm.get('districtId')?.enable();
        // Reset district when city changes
        this.addressForm.patchValue({
          districtId: null,
        });
      }
    });
  }

  fetchAllCountriesAPI(): void {
    this.addressService.getCountries().subscribe({
      next: (response) => {
        this.countries = response.result;
      },
      error: (error) => {
        console.error('Error fetching countries:', error);
      },
    });
  }

  fetchAllCitiesAPI(countryId: number): void {
    this.addressForm.get('cityId')?.disable();
    this.cities = [];

    this.addressService.GetCities(countryId).subscribe({
      next: (response) => {
        this.cities = response.result;
        this.addressForm.get('cityId')?.enable();
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
        this.addressForm.get('cityId')?.disable();
      },
    });
  }

  fetchAllDistrictsAPI(cityId: number): void {
    this.addressForm.get('districtId')?.disable();
    this.districts = [];

    this.addressService.getDistricts(cityId).subscribe({
      next: (response) => {
        this.districts = response.result;
        this.addressForm.get('districtId')?.enable();
      },
      error: (error) => {
        console.error('Error fetching districts:', error);
        this.addressForm.get('districtId')?.disable();
      },
    });
  }

  onClose(): void {
    this.close.emit();
    this.addressForm.reset({
      type: 0,
      isDefault: false,
      isPhoneVerified: false,
    });
  }

  onSubmit(): void {
    if (this.addressForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.addressForm.controls).forEach((key) => {
        const control = this.addressForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.saveAddress.emit(this.addressForm.value as CreateAddress);
    this.onClose();
  }
}
