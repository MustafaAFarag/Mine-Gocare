import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Address } from '../../pages/checkout/models/checkout.models';

@Component({
  selector: 'app-billing-address',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.css'],
})
export class BillingAddressComponent {
  @Input() billingAddresses: Address[] = [];
  @Output() addressSelected = new EventEmitter<number>();
  @Output() addNewAddress = new EventEmitter<void>();

  selectBillingAddress(id: number): void {
    this.addressSelected.emit(id);
  }

  addNewBillingAddress(): void {
    this.addNewAddress.emit();
  }
}
