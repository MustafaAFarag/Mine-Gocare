import { Component } from '@angular/core';

@Component({
  selector: 'app-instashop-section',
  imports: [],
  templateUrl: './instashop-section.component.html',
  styleUrl: './instashop-section.component.css',
})
export class InstashopSectionComponent {
  instaPosts = [
    { id: 1, image: 'https://placehold.co/600x600/E34F30/white?text=Insta+1' },
    { id: 2, image: 'https://placehold.co/600x600/7D56F1/white?text=Insta+2' },
    { id: 3, image: 'https://placehold.co/600x600/F7D969/white?text=Insta+3' },
    { id: 4, image: 'https://placehold.co/600x600/47B16E/white?text=Insta+4' },
    { id: 5, image: 'https://placehold.co/600x600/3DC1F2/white?text=Insta+5' },
  ];
}
