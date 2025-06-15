import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-points-redeem-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    DialogModule,
    InputNumberModule,
    ButtonModule,
  ],
  templateUrl: './points-redeem-modal.component.html',
  styleUrls: ['./points-redeem-modal.component.css'],
})
export class PointsRedeemModalComponent {
  @Input() visible: boolean = false;
  @Input() availablePoints: number = 0;
  @Input() exchangeRate: number = 0;
  @Input() isRedeeming: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() redeem = new EventEmitter<number>();

  redeemAmount: number = 0;
  hasError: boolean = false;

  getEquivalentAmount(): number {
    return this.redeemAmount * this.exchangeRate;
  }

  validatePoints(): void {
    this.hasError = this.redeemAmount > this.availablePoints;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Remove leading zeros
    value = value.replace(/^0+/, '');

    // If empty or just a single zero, set to 0
    if (!value || value === '') {
      value = '0';
    }

    // Convert to number and update
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      this.redeemAmount = numValue;
      this.validatePoints();
    }
  }

  onClose(): void {
    this.redeemAmount = 0;
    this.hasError = false;
    this.close.emit();
  }

  onRedeem(): void {
    if (this.redeemAmount > 0 && !this.hasError) {
      this.redeem.emit(this.redeemAmount);
    }
  }
}
