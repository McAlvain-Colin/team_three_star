import { Component, inject  } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { DeviceMapComponent } from '../device-map/device-map.component';
import { DeviceTableComponent } from '../device-table/device-table.component';
import { DeviceStatsComponent } from '../device-stats/device-stats.component';
import { DeviceDataComponent } from '../device-data/device-data.component';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatDividerModule } from '@angular/material/divider';

const time: string[] = ['1/15/23 10:05', '2/15/23 12:15', '3/15/23 04:15',
                        '4/15/23 10:05', '5/15/23 12:15', '6/15/23 04:15',
                        '7/15/23 10:05', '8/15/23 12:15', '9/15/23 04:15',
                        '10/15/23 10:05', '11/15/23 12:15', '12/15/23 04:15']

export interface DeviceElement {
  endDeviceId: number,
  appId: number,
  packetLoss: number[],
  gatewayId: string,
  time: string[],
  batteryStat: number[],
  endDeviceLocation: number[],
  gatewayLocation: number[],
  RSSI: {x: number, y: number}[],
  SNR: number[]
  distance: number[]
}

const ELEMENT_DATA: DeviceElement[] = [
  {
    endDeviceId: 123,
    appId: 456,
    packetLoss: [1.5, 2, 4],
    gatewayId: 'gtw1',
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
    batteryStat: [3, 2, 1],
    endDeviceLocation: [39.24, -119.92],
    gatewayLocation: [39.27, -119.95],
    RSSI: [
      {x: 100, y: 88},
      {x: 101, y: 88},
      {x: 102, y: 89},
      {x: 104, y: 89},
      {x: 103, y: 89},
      {x: 104, y: 89},
      {x: 105, y: 90},
      {x: 106, y: 91},
      {x: 107, y: 92},
      {x: 108, y: 94},
      {x: 109, y: 95},
      {x: 110, y: 97},
      {x: 111, y: 100}
    ],
    SNR: [20, 15, 13],
    distance: [100, 150, 200]
    
  },
  {
    endDeviceId: 120,
    appId: 431,
    packetLoss: [1.7, 1, 3],
    gatewayId: 'gtw3',
    time: ['11/16/23 10:05', '11/18/23 01:15', '11/19/23 04:15'],
    batteryStat: [3, 2.5, 1], 
    endDeviceLocation: [39.218423, -120.121765],
    gatewayLocation: [39.22, -120.14],
    RSSI: [
      {x: 100, y: 88},
      {x: 101, y: 88},
      {x: 102, y: 89},
      {x: 104, y: 89},
      {x: 103, y: 89},
      {x: 104, y: 89},
      {x: 105, y: 90},
      {x: 106, y: 91},
      {x: 107, y: 92},
      {x: 108, y: 94},
      {x: 109, y: 95},
      {x: 110, y: 97},
      {x: 111, y: 110}
    ],
    SNR: [20, 16, 12],
    distance: [100, 150, 200]
  },
  
  {
    endDeviceId: 143,
    appId: 464,
    packetLoss: [1, 2, 3],
    gatewayId: 'gtw2',
    time: ['11/15/23 10:05', '11/18/23 11:15', '11/19/23 04:15'],
    batteryStat: [4, 2, 1.5],
    endDeviceLocation: [39.257778, -120.051727],
    gatewayLocation: [39.29, -119.99],
    RSSI: [
      {x: 100, y: 88},
      {x: 101, y: 88},
      {x: 102, y: 89},
      {x: 104, y: 89},
      {x: 103, y: 89},
      {x: 104, y: 89},
      {x: 105, y: 90},
      {x: 106, y: 80},
      {x: 107, y: 92},
      {x: 108, y: 94},
      {x: 109, y: 95},
      {x: 110, y: 97},
      {x: 111, y: 120}
    ],
    SNR: [21, 13, 15],
    distance: [100, 150, 200]
  },
];


export interface DeviceData {
  endDeviceId: number,
  appId: number,
  DataName: string,
  DataValue: number[],
  time: string[]
  Unit: string
};

const DATA: DeviceData[] = 
[
  {endDeviceId: 123, appId: 456, DataName: 'Tahoe Temp Sensor North Shore', DataValue: [32, 30, 29, 30, 28, 31, 30, 29, 30, 28, 31, 30],  time, Unit: 'Celcius'},
  {endDeviceId: 120, appId: 431, DataName: 'Tahoe Temp Sensor South Shore', DataValue: [30, 28, 31, 29, 30, 28, 30, 29, 30, 30, 28, 31], time, Unit: 'Celcius' },
  {endDeviceId: 143, appId: 464, DataName: 'Mt. Rose Humidity Sensor', DataValue: [65, 85, 100, 98, 87, 96, 85, 100, 98, 87, 96, 85], time, Unit: 'Percent' }
];

export interface DataStats {
  endDeviceId: number;
  appId: number;
  DataName: string;
  mean: number[];
  variance: number[];
  standardDeviation: number[];
  time: string[];
}

const STATISTIC_DATA: DataStats[] = [
  {
    endDeviceId: 123,
    appId: 456,
    DataName: 'Tahoe North Shore Temperature',
    mean: [10, 9, 11, 8, 6, 7, 9, 11, 11, 8, 6, 7],
    variance: [5, 3, 8, 6, 7, 9, 3, 8, 6, 3, 8, 2],
    standardDeviation: [2, 3, 1, 3, 1, 2, 3, 1, 3, 4, 2, 5],
    time,
  },
  {
    endDeviceId: 5,
    appId: 456,
    DataName: 'Tahoe South Shore Temperature',
    mean: [20, 18, 24, 11, 8, 6, 7, 9, 11, 11, 8, 15],
    variance: [4, 6, 2, 6, 7, 3, 1, 3, 4, 3, 8, 2, 6, 7],
    standardDeviation: [5, 3, 4, 6, 2, 6, 7, 11, 8, 15],
    time,
  },
  {
    endDeviceId: 63,
    appId: 15,
    DataName: 'Mt. Rose Humidity',
    mean: [31, 30, 26, 29, 35, 24, 23, 28, 37, 29, 35, 24],
    variance: [6, 8, 4, 7, 3, 1, 3, 4, 5, 3, 4, 6],
    standardDeviation: [1, 3, 1, 3, 1, 3, 4, 5, 5, 3, 4, 6],
    time,
  },
];


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [DashboardNavComponent,
            DeviceDataComponent,
            DeviceStatsComponent,
            DeviceTableComponent,
            DeviceMapComponent,
            TempNavBarComponent,
            MatDividerModule]
})
export class DashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);

  constructor(breakpointObserver: BreakpointObserver) {
    this.breakpointObserver = breakpointObserver;
  }

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  dataSource: DeviceElement[] = ELEMENT_DATA;
  data_input: DeviceData[] = DATA;
  stats_data: DataStats[] = STATISTIC_DATA;
}
