import { Component } from '@angular/core';

export interface DeviceElement {
  endDeviceId: number,
  appId: number,
  packetLoss: number[],
  gatewayId: string,
  time: string[],
  batteryStat: number[],
  location: number[]
}

const ELEMENT_DATA: DeviceElement[] = [
  {
    endDeviceId: 123,
    appId: 456,
    packetLoss: [1.5, 2, 4],
    gatewayId: 'gtw1',
    time: ['11/17/23 10:05', '11/18/23 12:15', '11/19/23 04:15'],
    batteryStat: [3, 2, 1],
    location: [39.24, -119.92]
  },
  {
    endDeviceId: 120,
    appId: 431,
    packetLoss: [1.7, 1, 3],
    gatewayId: 'gtw3',
    time: ['11/16/23 10:05', '11/18/23 01:15', '11/19/23 04:15'],
    batteryStat: [3, 2.5, 1], 
    location: [39.218423, -120.121765]
  },
  {
    endDeviceId: 143,
    appId: 464,
    packetLoss: [1, 2, 3],
    gatewayId: 'gtw2',
    time: ['11/15/23 10:05', '11/18/23 11:15', '11/19/23 04:15'],
    batteryStat: [4, 2, 1.5],
    location: [39.257778, -120.051727]
  },
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'cssi_web_portal';

  dataSource: DeviceElement[] = ELEMENT_DATA;
}
