import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PointTransaction {
  id: number;
  date: string;
  points: number;
  remark: string;
  status: 'debit' | 'credit';
}

@Component({
  selector: 'app-points',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './points.component.html',
  styleUrls: ['./points.component.css'],
})
export class PointsComponent {
  totalPoints: number = 1970;
  conversionRate: number = 0.03;
  currentPage: number = 1;
  totalPages: number = 1;

  pointTransactions: PointTransaction[] = [
    {
      id: 1,
      date: '21 Jun 2024 01:28:PM',
      points: 39,
      remark: 'Admin has debited the balance.',
      status: 'debit',
    },
    {
      id: 2,
      date: '21 Jun 2024 01:28:PM',
      points: 23,
      remark: 'Admin has debited the balance.',
      status: 'debit',
    },
    {
      id: 3,
      date: '21 Jun 2024 01:28:PM',
      points: 532,
      remark: 'Admin has credited the balance.',
      status: 'credit',
    },
    {
      id: 4,
      date: '21 Jun 2024 01:28:PM',
      points: 1500,
      remark: 'Admin has credited the balance.',
      status: 'credit',
    },
  ];

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }
}
