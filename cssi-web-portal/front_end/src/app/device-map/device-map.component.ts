import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../app.component';
import { MatRippleModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-device-map',
    templateUrl: './device-map.component.html',
    styleUrls: ['./device-map.component.css'],
    standalone: true,
    imports: [
        MatCardModule,
        MatTableModule,
        MatRippleModule,
    ],
})
export class DeviceMapComponent {
  @Input() Devicelist!: DeviceElement[];
}
