import { Component, inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';


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