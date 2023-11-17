import { Component } from '@angular/core';

export interface DeviceElement {
  endDeviceId: number,
  appId: number,
  packetLoss: number[]
  
  
};

const ELEMENT_DATA: DeviceElement[] = 
[
  {endDeviceId: 123, appId: 456, packetLoss: [1.5, 2, 4, 2, 4, 2,1,2]},
  {endDeviceId: 12, appId: 431, packetLoss: [1.7, 1, 3, 2, 4, 2,4,1]},
  {endDeviceId: 143, appId: 464, packetLoss: [1,2,3,4,2,1,2,1]}
];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Device_Health';

  dataSource: DeviceElement[] = ELEMENT_DATA;
}
