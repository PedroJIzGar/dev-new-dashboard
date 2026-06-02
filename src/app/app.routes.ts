import { Routes } from '@angular/router';

import { DailyReport } from './features/daily-report/daily-report';
import { Overview } from './features/overview/overview';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: Overview },
  { path: 'daily', component: DailyReport },
  { path: 'daily/:date', component: DailyReport },
  { path: '**', redirectTo: 'overview' },
];
