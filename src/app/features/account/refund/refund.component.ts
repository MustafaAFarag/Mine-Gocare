import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RefundRequest {
  id: number;
  orderNumber: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  reason: string;
  createdAt: string;
}

@Component({
  selector: 'app-refund',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refund.component.html',
  styleUrls: ['./refund.component.css'],
})
export class RefundComponent {
  currentPage: number = 1;
  totalPages: number = 1;

  refundRequests: RefundRequest[] = [
    {
      id: 1,
      orderNumber: '#1000',
      status: 'rejected',
      reason: 'Item was damaged, also fabric was not good as expected',
      createdAt: '21 Jun 2024',
    },
    // You can add more refund requests here if needed
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

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      case 'processing':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  }
}
