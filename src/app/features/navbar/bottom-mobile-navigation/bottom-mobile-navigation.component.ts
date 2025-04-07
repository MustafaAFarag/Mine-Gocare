import { NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-bottom-mobile-navigation',
  imports: [RouterModule, NgIf],
  templateUrl: './bottom-mobile-navigation.component.html',
  styleUrl: './bottom-mobile-navigation.component.css',
})
export class BottomMobileNavigationComponent implements OnInit {
  cartCount: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.cartCount = 3;
  }
}
