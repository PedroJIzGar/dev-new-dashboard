import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import {
  LucideArchive,
  // LucideDatabase,
  LucideFileJson,
  LucideLayoutDashboard,
  // LucideSettings,
  LucideZap,
} from '@lucide/angular';

@Component({
  selector: 'app-dashboard-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    LucideArchive,
    // LucideDatabase,
    LucideFileJson,
    LucideLayoutDashboard,
    // LucideSettings,
    LucideZap,
  ],
  templateUrl: './dashboard-sidebar.html',
  styleUrl: './dashboard-sidebar.scss',
})
export class DashboardSidebar {}
