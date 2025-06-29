import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { AddressService } from '../../../services/address.service';
import {
  Address,
  City,
  Country,
  CreateAddress,
  District,
} from '../../../model/Address';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

type Language = 'en' | 'ar';

interface PhoneCountry {
  name: string;
  code: string;
  phoneCode: string;
  phoneCodeCountryId: number;
  flag: string;
}

const PHONE_COUNTRIES: PhoneCountry[] = [
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

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
})
export class AddressComponent implements OnInit {
  token = localStorage.getItem('accessToken');
  addresses: Address[] = [];
  loading = true;
  showAddressForm = false;
  editingAddressId: number | null = null;
  addressForm: FormGroup;
  submitting = false;
  deletingAddressId: number | null = null;
  currentLang: Language = 'en';
  cities!: City[];
  districts!: District[];
  countries!: Country[];
  loadingCities = false;
  loadingDistricts = false;
  showCountryDropdown = false;
  selectedPhoneCountry: PhoneCountry = PHONE_COUNTRIES[0];
  phoneCountries = PHONE_COUNTRIES;

  constructor(
    private addressService: AddressService,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private messageService: MessageService,
  ) {
    this.addressForm = this.createAddressForm();

    this.currentLang = this.translateService.currentLang as Language;
    this.translateService.onLangChange.subscribe((event) => {
      this.currentLang = event.lang as Language;
    });
  }

  ngOnInit(): void {
    this.fetchClientAddressesAPI();
    this.fetchAllCountriesAPI();

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

    // Add listener for phone number input
    this.addressForm.get('phoneNumber')?.valueChanges.subscribe((value) => {
      if (value) {
        this.onPhoneNumberInput(value);
      }
    });
  }

  createAddressForm(): FormGroup {
    return this.fb.group({
      countryId: [null, Validators.required],
      cityId: new FormControl(
        { value: null, disabled: true },
        Validators.required,
      ),
      districtId: new FormControl(
        { value: null, disabled: true },
        Validators.required,
      ),
      latitude: [''],
      longitude: [''],
      address: ['', Validators.required],
      mapAddress: [''],
      phoneNumber: ['', [Validators.required, this.phoneNumberValidator()]],
      isDefault: [false],
      type: [0, Validators.required],
      fullName: ['', Validators.required],
      isPhoneVerified: [false],
    });
  }

  private phoneNumberValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      // Remove any non-digit characters
      const digits = value.replace(/\D/g, '');

      if (this.selectedPhoneCountry.code === 'EG') {
        // Egypt: 11 digits starting with 0, or 10 digits without 0
        const egyptPatternWithZero = /^0\d{10}$/;
        const egyptPatternWithoutZero = /^[1-9]\d{9}$/;
        return egyptPatternWithZero.test(digits) ||
          egyptPatternWithoutZero.test(digits)
          ? null
          : { invalidPhoneNumber: true };
      } else if (this.selectedPhoneCountry.code === 'SA') {
        // Saudi: 9 digits
        const saudiPattern = /^\d{9}$/;
        return saudiPattern.test(digits) ? null : { invalidPhoneNumber: true };
      }

      return { invalidPhoneNumber: true };
    };
  }

  onPhoneNumberInput(value: string): void {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) {
      // Remove any non-numeric characters
      const numericOnly = value.replace(/\D/g, '');
      this.addressForm.get('phoneNumber')?.setValue(numericOnly);
      return;
    }

    if (this.selectedPhoneCountry.code === 'EG') {
      // If it starts with 0, limit to 11 digits
      if (value.startsWith('0') && value.length > 11) {
        this.addressForm.get('phoneNumber')?.setValue(value.slice(0, 11));
      }
      // If it doesn't start with 0, limit to 10 digits
      else if (!value.startsWith('0') && value.length > 10) {
        this.addressForm.get('phoneNumber')?.setValue(value.slice(0, 10));
      }
    } else if (this.selectedPhoneCountry.code === 'SA') {
      // Saudi numbers are 9 digits
      if (value.length > 9) {
        this.addressForm.get('phoneNumber')?.setValue(value.slice(0, 9));
      }
    }
  }

  fetchAllCitiesAPI(countryId: number) {
    this.loadingCities = true;
    this.addressForm.get('cityId')?.disable();
    this.cities = [];

    this.addressService.GetCities(countryId).subscribe({
      next: (response) => {
        this.cities = response.result;
        this.addressForm.get('cityId')?.enable();
        this.loadingCities = false;
      },
      error: (error) => {
        console.error('Error fetching cities:', error);
        this.addressForm.get('cityId')?.disable();
        this.loadingCities = false;
      },
    });
  }

  fetchAllDistrictsAPI(cityId: number) {
    this.loadingDistricts = true;
    this.addressForm.get('districtId')?.disable();
    this.districts = [];

    this.addressService.getDistricts(cityId).subscribe({
      next: (response) => {
        this.districts = response.result;
        this.addressForm.get('districtId')?.enable();
        this.loadingDistricts = false;
      },
      error: (error) => {
        console.error('Error fetching districts:', error);
        this.addressForm.get('districtId')?.disable();
        this.loadingDistricts = false;
      },
    });
  }

  fetchAllCountriesAPI() {
    this.addressService.getCountries().subscribe({
      next: (response) => {
        this.countries = response.result;
      },
    });
  }

  fetchClientAddressesAPI() {
    this.loading = true;
    this.addressService.getClientAddresses(this.token as string).subscribe({
      next: (response) => {
        this.addresses = response.result;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching addresses:', error);
        this.loading = false;
      },
    });
  }

  getTypeLabel(type: number): string {
    switch (type) {
      case 0:
        return this.translateService.instant('address.types.home');
      case 1:
        return this.translateService.instant('address.types.office');
      case 2:
        return this.translateService.instant('address.types.other');
      default:
        return this.translateService.instant('address.types.other');
    }
  }

  getTypeClass(type: number): string {
    switch (type) {
      case 0:
        return 'bg-hover-color text-white';
      case 1:
        return 'bg-hover-color text-white';
      case 2:
        return 'bg-hover-color text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  // Helper method to get localized name based on current language
  getLocalizedName(item: any): string {
    if (!item || !item.name) return '';
    return item.name[this.currentLang] || item.name.en || '';
  }

  editAddress(id: number): void {
    this.editingAddressId = id;
    this.showAddressForm = true;

    const addressToEdit = this.addresses.find((a) => a.id === id);

    if (addressToEdit) {
      // Enable the controls before setting values
      this.addressForm.get('cityId')?.enable();
      this.addressForm.get('districtId')?.enable();

      // First fetch cities for the country
      this.loadingCities = true;
      this.addressService.GetCities(addressToEdit.country.id).subscribe({
        next: (response) => {
          this.cities = response.result;
          this.addressForm.get('cityId')?.enable();
          this.loadingCities = false;

          // Set country and city first
          this.addressForm.patchValue({
            countryId: addressToEdit.country.id,
            cityId: addressToEdit.city.id,
          });

          // After cities are loaded, fetch districts for the city
          this.loadingDistricts = true;
          this.addressService.getDistricts(addressToEdit.city.id).subscribe({
            next: (districtResponse) => {
              this.districts = districtResponse.result;
              this.addressForm.get('districtId')?.enable();
              this.loadingDistricts = false;

              // Set the rest of the form values including district
              setTimeout(() => {
                this.addressForm.patchValue({
                  districtId: addressToEdit.district.id,
                  address: addressToEdit.address,
                  mapAddress: addressToEdit.mapAddress,
                  phoneNumber: addressToEdit.phoneNumber,
                  isDefault: addressToEdit.isDefault,
                  type: addressToEdit.type,
                  fullName: addressToEdit.fullName,
                  isPhoneVerified: addressToEdit.isPhoneVerified,
                  latitude: addressToEdit.latitude,
                  longitude: addressToEdit.longitude,
                });
              }, 0);
            },
            error: (error) => {
              console.error('Error fetching districts:', error);
              this.addressForm.get('districtId')?.disable();
              this.loadingDistricts = false;
            },
          });
        },
        error: (error) => {
          console.error('Error fetching cities:', error);
          this.addressForm.get('cityId')?.disable();
          this.loadingCities = false;
        },
      });
    }
  }

  addNewAddress(): void {
    this.editingAddressId = null;
    this.showAddressForm = true;
    this.addressForm.reset({
      type: 0,
      isDefault: this.addresses.length === 0,
      isPhoneVerified: false,
    });
  }

  cancelForm(): void {
    this.showAddressForm = false;
    this.editingAddressId = null;
  }

  submitForm(): void {
    if (this.addressForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.addressForm.controls).forEach((key) => {
        const control = this.addressForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formData = this.addressForm.value;
    this.submitting = true;

    if (this.editingAddressId) {
      // Update existing address
      const updateData = {
        ...formData,
        id: this.editingAddressId,
      };

      this.addressService
        .updateAddress(this.token as string, updateData)
        .subscribe({
          next: (response) => {
            this.submitting = false;
            this.showAddressForm = false;
            this.editingAddressId = null;
            this.fetchClientAddressesAPI(); // Refresh the address list
          },
          error: (error) => {
            console.error('Error updating address:', error);
            this.submitting = false;
          },
        });
    } else {
      // Create new address
      this.addressService
        .createAddress(this.token as string, formData)
        .subscribe({
          next: (response) => {
            this.submitting = false;
            this.showAddressForm = false;
            this.fetchClientAddressesAPI(); // Refresh the address list
          },
          error: (error) => {
            console.error('Error saving address:', error);
            this.submitting = false;
          },
        });
    }
  }

  removeAddress(id: number): void {
    const addressToDelete = this.addresses.find((a) => a.id === id);

    if (addressToDelete?.isDefault) {
      // Show error toast for trying to delete default address
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant('address.cannotDeleteDefault'),
        detail: this.translateService.instant(
          'address.cannotDeleteDefaultDetail',
        ),
        life: 3000,
        styleClass: 'black-text-toast',
      });
      return;
    }

    if (confirm(this.translateService.instant('address.confirmDelete'))) {
      this.deletingAddressId = id;
      this.addressService.deleteAddress(this.token as string, id).subscribe({
        next: (response) => {
          this.deletingAddressId = null;
          this.fetchClientAddressesAPI(); // Refresh the address list
          // Show success toast
          this.messageService.add({
            severity: 'success',
            summary: this.translateService.instant('address.deleteSuccess'),
            detail: this.translateService.instant(
              'address.deleteSuccessDetail',
            ),
            life: 2000,
            styleClass: 'black-text-toast',
          });
        },
        error: (error) => {
          console.error('Error removing address:', error);
          this.deletingAddressId = null;
          // Show error toast
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('address.deleteError'),
            detail: this.translateService.instant('address.deleteErrorDetail'),
            life: 3000,
            styleClass: 'black-text-toast',
          });
        },
      });
    }
  }
}
