import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Address {
  id: number;
  name: string;
  type: 'new-home' | 'old-home' | 'office' | 'other';
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
}

@Component({
  selector: 'app-address',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.css'],
})
export class AddressComponent {
  addresses: Address[] = [
    {
      id: 1,
      name: 'John Doe',
      type: 'new-home',
      street: '26, Starts Hollow Colony',
      city: 'Denver',
      state: 'Colorado',
      country: 'United States',
      zipCode: '80014',
      phone: '+1 5531855339',
    },
    {
      id: 2,
      name: 'John Doe',
      type: 'old-home',
      street: '538, Claire New Street',
      city: 'San Jose',
      state: 'Colorado',
      country: 'United States',
      zipCode: '94088',
      phone: '+1 5531855339',
    },
    {
      id: 3,
      name: 'John Doe',
      type: 'office',
      street: '218, Row New Street',
      city: 'San Jose',
      state: 'California',
      country: 'United States',
      zipCode: '94088',
      phone: '+1 5531855339',
    },
  ];

  getTypeLabel(type: string): string {
    switch (type) {
      case 'new-home':
        return 'New Home';
      case 'old-home':
        return 'Old Home';
      case 'office':
        return 'Office';
      default:
        return 'Other';
    }
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'new-home':
        return 'bg-orange-400 text-white';
      case 'old-home':
        return 'bg-orange-400 text-white';
      case 'office':
        return 'bg-orange-400 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  }

  editAddress(id: number): void {
    console.log('Edit address with ID:', id);
    // This would typically open a modal or navigate to an edit form
  }

  removeAddress(id: number): void {
    console.log('Remove address with ID:', id);
    // This would typically show a confirmation dialog and then remove the address
  }

  addNewAddress(): void {
    console.log('Add new address');
    // This would typically open a modal or navigate to an add address form
  }
}
