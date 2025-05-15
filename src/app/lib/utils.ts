import { environment } from '../../environments/environment';

export function getFullImageUrl(relativePath?: string): string {
  if (!relativePath) return 'assets/default-image.png';
  return `https://gocare-back-develop.salonspace1.com/Attachments${relativePath.replace(/\\/g, '/')}`;
}
