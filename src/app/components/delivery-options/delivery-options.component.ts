import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { Subscription } from 'rxjs';

interface TimeSlot {
  id: string;
  time: {
    en: string;
    ar: string;
  };
}

@Component({
  selector: 'app-delivery-options',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './delivery-options.component.html',
  styleUrls: ['./delivery-options.component.css'],
})
export class DeliveryOptionsComponent implements OnInit, OnDestroy {
  @Input() deliveryOption: 'standard' | 'express' = 'standard';
  @Input() timeSlots: TimeSlot[] = [];
  @Input() selectedTimeSlot: string | null = null;

  @Output() deliveryOptionSelected = new EventEmitter<'standard' | 'express'>();
  @Output() timeSlotSelected = new EventEmitter<string>();

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

  selectDeliveryOption(option: 'standard' | 'express'): void {
    this.deliveryOptionSelected.emit(option);
  }

  selectTimeSlot(slotId: string): void {
    this.timeSlotSelected.emit(slotId);
  }

  getLocalizedTime(slot: TimeSlot): string {
    return (
      slot.time[this.currentLang as keyof typeof slot.time] || slot.time.en
    );
  }
}
