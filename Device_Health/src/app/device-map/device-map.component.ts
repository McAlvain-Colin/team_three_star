import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../app.component';

@Component({
  selector: 'app-device-map',
  templateUrl: './device-map.component.html',
  styleUrls: ['./device-map.component.css']
})
export class DeviceMapComponent {
  @Input() Devicelist!: DeviceElement [];

  

}
