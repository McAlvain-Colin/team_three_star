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
  {
    endDeviceId: 123,
    appId: 456,
    packetLoss: [1.5, 2, 4],
    gatewayId: 'gtw1',
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
    batteryStat: [3, 2, 1],
  },
  {
    endDeviceId: 120,
    appId: 431,
    packetLoss: [1.7, 1, 3],
    gatewayId: 'gtw3',
    time: ['11/16/23 10:05', '11/18/23 01:15', '11/19/23 04:15'],
    batteryStat: [3, 2.5, 1],
  },
  {
    endDeviceId: 143,
    appId: 464,
    packetLoss: [1, 2, 3],
    gatewayId: 'gtw2',
    time: ['11/15/23 10:05', '11/18/23 11:15', '11/19/23 04:15'],
    batteryStat: [4, 2, 1.5],
  },
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
