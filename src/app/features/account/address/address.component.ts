import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
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

type Language = 'en' | 'ar';

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
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

  constructor(
    private addressService: AddressService,
    private fb: FormBuilder,
    private translateService: TranslateService,
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
      type: [0, Validators.required],
      fullName: ['', Validators.required],
      isPhoneVerified: [false],
    });
  }

  fetchAllCitiesAPI(countryId: number) {
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

  fetchAllDistrictsAPI(cityId: number) {
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

  fetchAllCountriesAPI() {
    this.addressService.getCountries().subscribe({
      next: (response) => {
        this.countries = response.result;
        console.log('countries', this.countries);
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
        return this.translateService.instant('address.types.work');
      case 2:
        return this.translateService.instant('address.types.office');
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

      // Fetch cities and districts for the existing address
      this.fetchAllCitiesAPI(addressToEdit.country.id);
      this.fetchAllDistrictsAPI(addressToEdit.city.id);

      // Populate the form with existing values
      this.addressForm.patchValue({
        countryId: addressToEdit.country.id,
        cityId: addressToEdit.city.id,
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
    }
  }

  addNewAddress(): void {
    this.editingAddressId = null;
    this.showAddressForm = true;
    this.addressForm.reset({
      type: 0,
      isDefault: false,
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
            console.log('Address updated successfully:', response);
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
            console.log('Address saved successfully:', response);
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
    if (confirm(this.translateService.instant('address.confirmDelete'))) {
      this.deletingAddressId = id;
      this.addressService.deleteAddress(this.token as string, id).subscribe({
        next: (response) => {
          console.log('Address removed successfully');
          this.deletingAddressId = null;
          this.fetchClientAddressesAPI(); // Refresh the address list
        },
        error: (error) => {
          console.error('Error removing address:', error);
          this.deletingAddressId = null;
        },
      });
    }
  }
}
