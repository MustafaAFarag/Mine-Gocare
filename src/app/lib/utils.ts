import { environment } from '../../environments/environment';

export function getFullImageUrl(relativePath?: string): string {
  if (!relativePath) return 'assets/default-image.png';
  return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
}
