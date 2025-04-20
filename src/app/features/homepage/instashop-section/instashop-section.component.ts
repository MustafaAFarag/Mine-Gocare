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
    { id: 1, image: 'assets/images/settings/insta6-berry.jpg' },
    { id: 2, image: 'assets/images/settings/insta7-berry.jpg' },
    { id: 3, image: 'assets/images/settings/insta2-berry.jpg' },
    { id: 4, image: 'assets/images/settings/insta1-berry.jpg' },
    { id: 5, image: 'assets/images/settings/insta4-berry.jpg' },
  ];
}
