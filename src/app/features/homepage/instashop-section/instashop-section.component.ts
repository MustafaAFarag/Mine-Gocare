import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-instashop-section',
  imports: [CommonModule, TranslateModule],
  templateUrl: './instashop-section.component.html',
  styleUrl: './instashop-section.component.css',
})
export class InstashopSectionComponent {
  instaPosts = [
    { id: 1, image: 'assets/images/settings/gocare/gocare15.jpg' },
    { id: 2, image: 'assets/images/settings/gocare/gocare9.jpg' },
    { id: 3, image: 'assets/images/settings/gocare/gocare10.jpg' },
    { id: 4, image: 'assets/images/settings/gocare/gocare11.jpg' },
    { id: 5, image: 'assets/images/settings/gocare/gocare12.jpg' },
  ];
}
