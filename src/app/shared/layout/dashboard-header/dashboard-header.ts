import { Component, input, output } from '@angular/core';

import { LucideCalendarDays } from '@lucide/angular';

@Component({
  selector: 'app-dashboard-header',
  imports: [LucideCalendarDays],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.scss',
})
export class DashboardHeader {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly eyebrow = input.required<string>();

  readonly showDateSelector = input(false);
  readonly selectedDate = input<string | null>(null);
  readonly availableDates = input<string[]>([]);

  readonly dateChanged = output<string>();

  onDateChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.dateChanged.emit(select.value);
  }
}
