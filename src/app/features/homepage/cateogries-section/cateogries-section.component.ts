import { Component } from '@angular/core';

@Component({
  selector: 'app-cateogries-section',
  imports: [],
  templateUrl: './cateogries-section.component.html',
  styleUrl: './cateogries-section.component.css',
})
export class CateogriesSectionComponent {
  categories = [
    {
      name: 'Fruits',
      image: 'https://placehold.co/400x400/orange/white?text=Fruits',
    },
    {
      name: 'Berries Jam',
      image: 'https://placehold.co/400x400/purple/white?text=Berries+Jam',
    },
    {
      name: 'Berries Meals',
      image: 'https://placehold.co/400x400/green/white?text=Berries+Meals',
    },
    {
      name: 'BlackBerry',
      image: 'https://placehold.co/400x400/black/white?text=BlackBerry',
    },
    {
      name: 'RaspBerry',
      image: 'https://placehold.co/400x400/red/white?text=RaspBerry',
    },
  ];
}
