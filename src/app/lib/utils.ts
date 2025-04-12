import { environment } from '../../enviroments/enviroment';

export function getFullImageUrl(relativePath?: string): string {
  if (!relativePath) return 'assets/default-image.png';
  return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
}
