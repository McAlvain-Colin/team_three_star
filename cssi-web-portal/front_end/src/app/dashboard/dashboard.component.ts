import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DeviceMapComponent } from '../device-map/device-map.component';
import { DeviceTableComponent } from '../device-table/device-table.component';
import { DeviceStatsComponent } from '../device-stats/device-stats.component';
import { MatDividerModule } from '@angular/material/divider';
import { DeviceDataComponent } from '../device-data/device-data.component';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';

export interface DeviceElement {
  endDeviceId: number;
  appId: number;
  packetLoss: number[];
  gatewayId: string;
  time: string[];
  batteryStat: number[];
}

const ELEMENT_DATA: DeviceElement[] = [
  // Your data
];
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    DashboardNavComponent,
    DeviceDataComponent,
    MatDividerModule,
    DeviceStatsComponent,
    DeviceTableComponent,
    DeviceMapComponent,
    TempNavBarComponent,
  ],
})
export class DashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  dataSource: DeviceElement[] = ELEMENT_DATA;
}
