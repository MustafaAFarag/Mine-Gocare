import { Component } from '@angular/core';

@Component({
  selector: 'app-everyday-casual-section',
  imports: [],
  templateUrl: './everyday-casual-section.component.html',
  styleUrl: './everyday-casual-section.component.css',
})
export class EverydayCasualSectionComponent {
  categories: string[] = [
    'FRUITS',
    'BERRIES JAMS',
    'BERRIES MEALS',
    'BLACKBERRY',
    'RASPBERRY',
  ];
  selectedCategory: string = 'FRUITS';

  products = [
    {
      id: 1,
      name: 'Fresh Apples',
      price: 3.99,
      image: 'https://placehold.co/600x400/green/white?text=Fresh+Apples',
      category: 'FRUITS',
    },
    {
      id: 2,
      name: 'Organic Oranges',
      price: 4.99,
      image: 'https://placehold.co/600x400/orange/white?text=Organic+Oranges',
      category: 'FRUITS',
    },
    {
      id: 3,
      name: 'Peaches',
      price: 5.99,
      image: 'https://placehold.co/600x400/yellow/white?text=Peaches',
      category: 'FRUITS',
    },
    {
      id: 4,
      name: 'Strawberry Jam',
      price: 7.99,
      image: 'https://placehold.co/600x400/red/white?text=Strawberry+Jam',
      category: 'BERRIES JAMS',
    },
    {
      id: 5,
      name: 'Blueberry Jam',
      price: 8.99,
      image: 'https://placehold.co/600x400/blue/white?text=Blueberry+Jam',
      category: 'BERRIES JAMS',
    },
    {
      id: 6,
      name: 'Mixed Berry Jam',
      price: 9.99,
      image: 'https://placehold.co/600x400/purple/white?text=Mixed+Berry+Jam',
      category: 'BERRIES JAMS',
    },
    {
      id: 7,
      name: 'Berry Smoothie Bowl',
      price: 11.99,
      image: 'https://placehold.co/600x400/pink/white?text=Berry+Smoothie+Bowl',
      category: 'BERRIES MEALS',
    },
    {
      id: 8,
      name: 'Berry Pancakes',
      price: 10.99,
      image: 'https://placehold.co/600x400/lavender/white?text=Berry+Pancakes',
      category: 'BERRIES MEALS',
    },
    {
      id: 9,
      name: 'Berry Salad',
      price: 8.99,
      image: 'https://placehold.co/600x400/teal/white?text=Berry+Salad',
      category: 'BERRIES MEALS',
    },
    {
      id: 10,
      name: 'Fresh Blackberries',
      price: 6.99,
      image: 'https://placehold.co/600x400/black/white?text=Fresh+Blackberries',
      category: 'BLACKBERRY',
    },
    {
      id: 11,
      name: 'Blackberry Extract',
      price: 14.99,
      image:
        'https://placehold.co/600x400/darkblue/white?text=Blackberry+Extract',
      category: 'BLACKBERRY',
    },
    {
      id: 12,
      name: 'Blackberry Juice',
      price: 7.99,
      image: 'https://placehold.co/600x400/indigo/white?text=Blackberry+Juice',
      category: 'BLACKBERRY',
    },
    {
      id: 13,
      name: 'Fresh Raspberries',
      price: 6.99,
      image: 'https://placehold.co/600x400/red/white?text=Fresh+Raspberries',
      category: 'RASPBERRY',
    },
    {
      id: 14,
      name: 'Raspberry Syrup',
      price: 12.99,
      image: 'https://placehold.co/600x400/crimson/white?text=Raspberry+Syrup',
      category: 'RASPBERRY',
    },
    {
      id: 15,
      name: 'Dried Raspberries',
      price: 9.99,
      image:
        'https://placehold.co/600x400/darkred/white?text=Dried+Raspberries',
      category: 'RASPBERRY',
    },
  ];

  get filteredProducts() {
    return this.products
      .filter((product) => product.category === this.selectedCategory)
      .slice(0, 3);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }
}
