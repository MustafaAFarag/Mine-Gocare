import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Add a timeout to handle hydration
const bootstrapPromise = bootstrapApplication(AppComponent, appConfig);
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    reject(new Error('Application bootstrap timeout'));
  }, 30000); // 30 seconds timeout
});

Promise.race([bootstrapPromise, timeoutPromise]).catch((err) => {
  console.error('Application bootstrap error:', err);
  // Continue with the application even if hydration times out
  if (err.message === 'Application bootstrap timeout') {
    console.warn('Hydration timeout - continuing with client-side rendering');
    return bootstrapPromise;
  }
  throw err;
});
