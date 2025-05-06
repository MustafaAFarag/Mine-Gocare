import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Address } from '../../pages/checkout/models/checkout.models';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shipping-address',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './shipping-address.component.html',
  styleUrls: ['./shipping-address.component.css'],
})
export class ShippingAddressComponent implements OnInit, OnDestroy {
  @Input() shippingAddresses: Address[] = [];
  @Input() loading: boolean = false;
  @Output() addressSelected = new EventEmitter<number>();
  @Output() addNewAddress = new EventEmitter<void>();

  currentLang: string = 'en';
  private langSubscription: Subscription = new Subscription();

  constructor(private languageService: LanguageService) {}

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

  selectShippingAddress(id: number): void {
    this.addressSelected.emit(id);
  }

  addNewShippingAddress(): void {
    this.addNewAddress.emit();
  }
}
