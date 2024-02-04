import { Component } from '@angular/core';

export interface DeviceElement {
  endDeviceId: number;
  appId: number;
  packetLoss: number[];
  gatewayId: string;
  time: string[];
  batteryStat: number[];
  location: number[];
}

//Devloped by COlin and David, which is mock data to be feed into their respective tables, which showcase the visualization for the demo

const ELEMENT_DATA: DeviceElement[] = [
  {
    endDeviceId: 123,
    appId: 456,
    packetLoss: [1.5, 2, 4],
    gatewayId: 'gtw1',
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
    batteryStat: [3, 2, 1],
    location: [39.24, -119.92],
  },
  {
    endDeviceId: 120,
    appId: 431,
    packetLoss: [1.7, 1, 3],
    gatewayId: 'gtw3',
    time: ['11/16/23 10:05', '11/18/23 01:15', '11/19/23 04:15'],
    batteryStat: [3, 2.5, 1],
    location: [39.218423, -120.121765],
  },
  {
    endDeviceId: 143,
    appId: 464,
    packetLoss: [1, 2, 3],
    gatewayId: 'gtw2',
    time: ['11/15/23 10:05', '11/18/23 11:15', '11/19/23 04:15'],
    batteryStat: [4, 2, 1.5],
    location: [39.257778, -120.051727],
  },
];

export interface DeviceData {
  endDeviceId: number;
  appId: number;
  DataName: string;
  DataValue: number[];
  time: string[];
  Unit: string;
}

const DATA: DeviceData[] = [
  {
    endDeviceId: 123,
    appId: 456,
    DataName: 'Tahoe North Shore Temperature',
    DataValue: [1.5, 2, 4],
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
    Unit: 'Celcius',
  },
  {
    endDeviceId: 5,
    appId: 456,
    DataName: 'Tahoe South Shore Temperature',
    DataValue: [5.6, 4, 8],
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
    Unit: 'Celcius',
  },
  {
    endDeviceId: 63,
    appId: 15,
    DataName: 'Mt. Rose Humidity',
    DataValue: [25, 16, 42],
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
    Unit: 'H2O ppm',
  },
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
    mean: [10, 9, 11],
    variance: [5, 3, 8],
    standardDeviation: [2, 3, 1],
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
  },
  {
    endDeviceId: 5,
    appId: 456,
    DataName: 'Tahoe South Shore Temperature',
    mean: [20, 18, 24],
    variance: [4, 6, 2],
    standardDeviation: [5, 3, 4],
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
  },
  {
    endDeviceId: 63,
    appId: 15,
    DataName: 'Mt. Rose Humidity',
    mean: [31, 30, 26],
    variance: [6, 8, 4],
    standardDeviation: [1, 3, 1],
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  template: `
    <my-rm>
      <my-login-form
        [error]="'Username or password invalid'"
        (menu)="open($event)"
        >Your Form With Error Message</my-login-form
      >
    </my-rm>
  `,
  styles: [],
})
export class AppComponent {
  title = 'cssi_web_portal';
  isDarkMode: boolean = false;

  dataSource: DeviceElement[] = ELEMENT_DATA;
  data: DeviceData[] = DATA;
  stats: DataStats[] = STATISTIC_DATA;
}