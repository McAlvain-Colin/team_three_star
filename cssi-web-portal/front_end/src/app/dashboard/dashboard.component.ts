import { Component, inject } from '@angular/core';
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
import { HttpClient, HttpHeaders } from '@angular/common/http';

//mock data for device health
const time: string[] = [
  '1/15/23 10:05',
  '2/15/23 12:15',
  '3/15/23 04:15',
  '4/15/23 10:05',
  '5/15/23 12:15',
  '6/15/23 04:15',
  '7/15/23 10:05',
  '8/15/23 12:15',
  '9/15/23 04:15',
  '10/15/23 10:05',
  '11/15/23 12:15',
  '12/15/23 04:15',
];

//the interface which has what the team views as central information which will be retrieved from the device JSON data, consisting of the Device and Gateway EUI, packet loss, time recorded, battery life, RSSI, SNR
//distance, location of each device/gateway, application ID. This information was based off "The Things Stack"  JSON file information provided in the website https://www.thethingsindustries.com/docs/the-things-stack/concepts/data-formats/
export interface DeviceElement {
  endDeviceId: number;
  appId: number;
  packetLoss: number[];
  gatewayId: string;
  time: string[];
  batteryStat: number[];
  endDeviceLocation: number[];
  gatewayLocation: number[];
  RSSI: { x: number; y: number }[];
  SNR: number[];
  distance: number[];
}

//Team created mock data of what data can be retrieved from backend for presentation purposes.
const ELEMENT_DATA: DeviceElement[] = [
  {
    endDeviceId: 123,
    appId: 456,
    packetLoss: [6, 8, 4, 7, 3, 1, 3, 4, 5, 3, 4, 6],
    gatewayId: 'gtw1',
    time: time,
    batteryStat: [3, 2, 1, 7, 3, 1, 3, 2, 1, 7, 8, 4],
    endDeviceLocation: [39.24, -119.92],
    gatewayLocation: [39.27, -119.95],
    RSSI: [
      { x: 100, y: 88 },
      { x: 101, y: 88 },
      { x: 102, y: 89 },
      { x: 104, y: 89 },
      { x: 103, y: 89 },
      { x: 104, y: 89 },
      { x: 105, y: 90 },
      { x: 106, y: 91 },
      { x: 107, y: 92 },
      { x: 108, y: 94 },
      { x: 109, y: 95 },
      { x: 110, y: 97 },
      { x: 111, y: 100 },
      { x: 98, y: 101 },
      { x: 101, y: 84 },
      { x: 100, y: 99 },
      { x: 99, y: 115 },
      { x: 98, y: 102 },
      { x: 97, y: 99 },
      { x: 105, y: 105 },
      { x: 93, y: 92 },
      { x: 111, y: 100 },
      { x: 125, y: 85 },
      { x: 137, y: 142 },
      { x: 108, y: 120 },
      { x: 113, y: 136 },
      { x: 128, y: 102 },
      { x: 134, y: 70 },
      { x: 64, y: 109 },
      { x: 147, y: 141 },
      { x: 121, y: 87 },
      { x: 103, y: 118 },
      { x: 78, y: 88 },
      { x: 91, y: 80 },
      { x: 137, y: 125 },
      { x: 94, y: 129 },
      { x: 82, y: 101 },
      { x: 120, y: 100 },
      { x: 141, y: 104 },
      { x: 67, y: 95 },
      { x: 111, y: 103 },
      { x: 112, y: 137 },
      { x: 136, y: 134 },
      { x: 92, y: 112 },
      { x: 98, y: 76 },
      { x: 78, y: 72 },
      { x: 94, y: 136 },
      { x: 84, y: 141 },
      { x: 91, y: 105 },
      { x: 144, y: 85 },
      { x: 108, y: 75 },
      { x: 138, y: 105 },
      { x: 80, y: 82 },
      { x: 102, y: 72 },
      { x: 68, y: 95 },
      { x: 136, y: 94 },
      { x: 113, y: 106 },
      { x: 68, y: 79 },
      { x: 137, y: 73 },
      { x: 55, y: 139 },
      { x: 120, y: 66 },
      { x: 113, y: 117 },
      { x: 92, y: 142 },
      { x: 78, y: 59 },
      { x: 129, y: 58 },
      { x: 99, y: 116 },
      { x: 77, y: 116 },
      { x: 97, y: 144 },
      { x: 106, y: 77 },
      { x: 58, y: 134 },
      { x: 104, y: 109 },
      { x: 65, y: 142 },
      { x: 89, y: 76 },
      { x: 110, y: 85 },
      { x: 79, y: 136 },
      { x: 73, y: 138 },
      { x: 118, y: 105 },
      { x: 130, y: 103 },
      { x: 95, y: 121 },
      { x: 80, y: 106 },
      { x: 72, y: 57 },
      { x: 83, y: 92 },
      { x: 99, y: 145 },
      { x: 106, y: 84 },
      { x: 119, y: 95 },
      { x: 74, y: 141 },
      { x: 132, y: 67 },
      { x: 123, y: 112 },
      { x: 89, y: 58 },
      { x: 105, y: 122 },
      { x: 107, y: 56 },
      { x: 120, y: 70 },
      { x: 54, y: 145 },
      { x: 119, y: 111 },
      { x: 79, y: 98 },
      { x: 69, y: 108 },
      { x: 128, y: 92 },
      { x: 91, y: 56 },
      { x: 120, y: 108 },
      { x: 70, y: 118 },
      { x: 96, y: 110 },
      { x: 142, y: 105 },
      { x: 109, y: 91 },
      { x: 80, y: 61 },
      { x: 98, y: 68 },
      { x: 100, y: 76 },
      { x: 59, y: 104 },
      { x: 75, y: 78 },
      { x: 100, y: 146 },
      { x: 96, y: 78 },
      { x: 91, y: 62 },
      { x: 102, y: 141 },
      { x: 93, y: 99 },
      { x: 141, y: 79 },
      { x: 70, y: 109 },
      { x: 71, y: 125 },
      { x: 102, y: 125 },
      { x: 139, y: 75 },
      { x: 72, y: 95 },
      { x: 90, y: 78 },
      { x: 86, y: 141 },
      { x: 62, y: 77 },
      { x: 94, y: 130 },
      { x: 144, y: 70 },
      { x: 62, y: 64 },
      { x: 85, y: 75 },
      { x: 95, y: 129 },
      { x: 113, y: 82 },
      { x: 130, y: 128 },
      { x: 62, y: 109 },
      { x: 107, y: 70 },
      { x: 82, y: 115 },
      { x: 85, y: 59 },
      { x: 85, y: 115 },
      { x: 98, y: 113 },
      { x: 86, y: 59 },
      { x: 129, y: 98 },
    ],
    SNR: [22, 19, 18, 23, 21, 20, 17, 24, 19, 16, 21, 18],
    distance: [195, 130, 150, 105, 180, 140, 160, 200, 110, 120, 155, 90],
  },
  {
    endDeviceId: 120,
    appId: 431,
    packetLoss: [1.7, 1, 3, 6, 8, 4, 7, 3, 1, 3, 4, 5],
    gatewayId: 'gtw3',
    time: time,
    batteryStat: [3, 2.5, 1, 3, 6, 8, 4, 7, 4, 4, 9, 6],
    endDeviceLocation: [39.218423, -120.1217],
    gatewayLocation: [39.22, -120.14],
    RSSI: [
      { x: 100, y: 88 },
      { x: 101, y: 88 },
      { x: 102, y: 89 },
      { x: 104, y: 89 },
      { x: 103, y: 89 },
      { x: 104, y: 89 },
      { x: 105, y: 90 },
      { x: 106, y: 91 },
      { x: 107, y: 92 },
      { x: 108, y: 94 },
      { x: 109, y: 95 },
      { x: 110, y: 97 },
      { x: 111, y: 110 },
      { x: 113, y: 129 },
      { x: 88, y: 119 },
      { x: 54, y: 61 },
      { x: 80, y: 91 },
      { x: 119, y: 80 },
      { x: 136, y: 57 },
      { x: 61, y: 123 },
      { x: 53, y: 89 },
      { x: 91, y: 98 },
      { x: 106, y: 134 },
      { x: 98, y: 106 },
      { x: 130, y: 111 },
      { x: 74, y: 107 },
      { x: 112, y: 66 },
      { x: 85, y: 120 },
      { x: 61, y: 98 },
      { x: 103, y: 95 },
      { x: 142, y: 97 },
      { x: 54, y: 88 },
      { x: 100, y: 53 },
      { x: 99, y: 135 },
      { x: 137, y: 125 },
      { x: 79, y: 121 },
      { x: 84, y: 149 },
      { x: 117, y: 104 },
      { x: 93, y: 65 },
      { x: 81, y: 75 },
      { x: 104, y: 138 },
      { x: 95, y: 55 },
      { x: 112, y: 69 },
      { x: 144, y: 131 },
      { x: 80, y: 83 },
      { x: 103, y: 83 },
      { x: 128, y: 146 },
      { x: 136, y: 80 },
      { x: 140, y: 122 },
      { x: 117, y: 78 },
      { x: 73, y: 73 },
      { x: 61, y: 70 },
      { x: 110, y: 82 },
      { x: 58, y: 56 },
      { x: 92, y: 76 },
      { x: 141, y: 127 },
      { x: 114, y: 73 },
      { x: 79, y: 143 },
      { x: 136, y: 92 },
      { x: 106, y: 144 },
      { x: 64, y: 132 },
      { x: 89, y: 108 },
      { x: 118, y: 67 },
      { x: 99, y: 91 },
      { x: 71, y: 143 },
      { x: 81, y: 107 },
      { x: 77, y: 135 },
      { x: 85, y: 134 },
      { x: 62, y: 83 },
      { x: 130, y: 58 },
      { x: 123, y: 121 },
      { x: 92, y: 87 },
      { x: 107, y: 89 },
      { x: 116, y: 105 },
      { x: 144, y: 105 },
      { x: 97, y: 67 },
      { x: 127, y: 121 },
      { x: 130, y: 100 },
      { x: 62, y: 96 },
      { x: 113, y: 54 },
      { x: 98, y: 125 },
      { x: 108, y: 69 },
      { x: 129, y: 125 },
      { x: 113, y: 86 },
      { x: 120, y: 141 },
      { x: 62, y: 142 },
      { x: 94, y: 140 },
      { x: 56, y: 93 },
      { x: 92, y: 116 },
      { x: 54, y: 66 },
      { x: 96, y: 60 },
      { x: 126, y: 69 },
      { x: 82, y: 96 },
      { x: 86, y: 62 },
      { x: 88, y: 113 },
      { x: 92, y: 71 },
      { x: 140, y: 56 },
      { x: 59, y: 132 },
      { x: 66, y: 78 },
      { x: 106, y: 51 },
      { x: 108, y: 59 },
      { x: 68, y: 126 },
      { x: 82, y: 97 },
      { x: 73, y: 82 },
      { x: 86, y: 69 },
      { x: 105, y: 70 },
      { x: 105, y: 62 },
      { x: 118, y: 113 },
      { x: 59, y: 67 },
      { x: 121, y: 75 },
      { x: 76, y: 66 },
      { x: 140, y: 66 },
      { x: 68, y: 129 },
      { x: 55, y: 125 },
      { x: 125, y: 94 },
      { x: 75, y: 85 },
      { x: 72, y: 119 },
      { x: 64, y: 80 },
      { x: 110, y: 98 },
      { x: 68, y: 61 },
      { x: 94, y: 87 },
      { x: 88, y: 69 },
      { x: 77, y: 69 },
      { x: 129, y: 92 },
      { x: 108, y: 89 },
      { x: 138, y: 98 },
      { x: 70, y: 84 },
      { x: 65, y: 51 },
    ],
    SNR: [18, 19, 21, 17, 16, 19, 20, 18, 22, 19, 17, 21],
    distance: [90, 130, 180, 110, 160, 140, 105, 150, 195, 120, 155, 200],
  },

  {
    endDeviceId: 143,
    appId: 464,
    packetLoss: [1, 2, 3, 4, 2, 1.5, 6, 8, 4, 2, 6, 4],
    gatewayId: 'gtw2',
    time: time,
    batteryStat: [4, 2, 1.5, 6, 8, 4, 7, 2, 1.5, 0, 4, 7],
    endDeviceLocation: [39.257778, -120.051727],
    gatewayLocation: [39.29, -119.99],
    RSSI: [
      { x: 100, y: 88 },
      { x: 101, y: 88 },
      { x: 102, y: 89 },
      { x: 104, y: 89 },
      { x: 103, y: 89 },
      { x: 104, y: 89 },
      { x: 105, y: 90 },
      { x: 106, y: 80 },
      { x: 107, y: 92 },
      { x: 108, y: 94 },
      { x: 109, y: 95 },
      { x: 110, y: 97 },
      { x: 111, y: 120 },
      { x: 100, y: 88 },
      { x: 101, y: 88 },
      { x: 102, y: 89 },
      { x: 104, y: 89 },
      { x: 103, y: 89 },
      { x: 104, y: 89 },
      { x: 105, y: 90 },
      { x: 106, y: 91 },
      { x: 107, y: 92 },
      { x: 108, y: 94 },
      { x: 109, y: 95 },
      { x: 110, y: 97 },
      { x: 111, y: 110 },
      { x: 113, y: 129 },
      { x: 88, y: 119 },
      { x: 54, y: 61 },
      { x: 80, y: 91 },
      { x: 119, y: 80 },
      { x: 136, y: 57 },
      { x: 61, y: 123 },
      { x: 53, y: 89 },
      { x: 91, y: 98 },
      { x: 106, y: 134 },
      { x: 98, y: 106 },
      { x: 130, y: 111 },
      { x: 74, y: 107 },
      { x: 112, y: 66 },
      { x: 85, y: 120 },
      { x: 61, y: 98 },
      { x: 103, y: 95 },
      { x: 142, y: 97 },
      { x: 54, y: 88 },
      { x: 100, y: 53 },
      { x: 99, y: 135 },
      { x: 137, y: 125 },
      { x: 79, y: 121 },
      { x: 84, y: 149 },
      { x: 117, y: 104 },
      { x: 93, y: 65 },
      { x: 81, y: 75 },
      { x: 104, y: 138 },
      { x: 95, y: 55 },
      { x: 112, y: 69 },
      { x: 144, y: 131 },
      { x: 111, y: 103 },
      { x: 112, y: 137 },
      { x: 136, y: 134 },
      { x: 92, y: 112 },
      { x: 98, y: 76 },
      { x: 78, y: 72 },
      { x: 94, y: 136 },
      { x: 84, y: 141 },
      { x: 91, y: 105 },
      { x: 144, y: 85 },
      { x: 108, y: 75 },
      { x: 138, y: 105 },
      { x: 80, y: 82 },
      { x: 102, y: 72 },
      { x: 68, y: 95 },
      { x: 136, y: 94 },
      { x: 113, y: 106 },
      { x: 68, y: 79 },
      { x: 137, y: 73 },
      { x: 55, y: 139 },
      { x: 120, y: 66 },
      { x: 113, y: 117 },
      { x: 92, y: 142 },
      { x: 78, y: 59 },
      { x: 129, y: 58 },
      { x: 99, y: 116 },
      { x: 77, y: 116 },
      { x: 97, y: 144 },
      { x: 106, y: 77 },
      { x: 58, y: 134 },
      { x: 104, y: 109 },
      { x: 65, y: 142 },
      { x: 89, y: 76 },
      { x: 110, y: 85 },
      { x: 79, y: 136 },
      { x: 73, y: 138 },
      { x: 118, y: 105 },
      { x: 130, y: 103 },
      { x: 95, y: 121 },
      { x: 80, y: 106 },
      { x: 72, y: 57 },
      { x: 83, y: 92 },
      { x: 99, y: 145 },
      { x: 106, y: 84 },
      { x: 119, y: 95 },
      { x: 74, y: 141 },
      { x: 132, y: 67 },
    ],
    SNR: [18, 21, 17, 19, 20, 22, 16, 23, 19, 18, 20, 21],
    distance: [90, 180, 110, 130, 140, 195, 160, 105, 120, 150, 155, 200],
  },
];

//mock data for device data
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
    DataName: 'Tahoe Temp Sensor North Shore',
    DataValue: [32, 30, 29, 30, 28, 31, 30, 29, 30, 28, 31, 30],
    time,
    Unit: 'Celcius',
  },
  {
    endDeviceId: 120,
    appId: 431,
    DataName: 'Tahoe Temp Sensor South Shore',
    DataValue: [30, 28, 31, 29, 30, 28, 30, 29, 30, 30, 28, 31],
    time,
    Unit: 'Celcius',
  },
  {
    endDeviceId: 143,
    appId: 464,
    DataName: 'Mt. Rose Humidity Sensor',
    DataValue: [65, 85, 100, 98, 87, 96, 85, 100, 98, 87, 96, 85],
    time,
    Unit: 'Percent',
  },
];
//mock data for device stats
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
  imports: [
    DashboardNavComponent,
    DeviceDataComponent,
    DeviceStatsComponent,
    DeviceTableComponent,
    DeviceMapComponent,
    TempNavBarComponent,
    MatDividerModule,
  ],
})
export class DashboardComponent {
  private breakpointObserver = inject(BreakpointObserver);

  base_url : string = 'http://localhost:5000';


  constructor(breakpointObserver: BreakpointObserver, private http : HttpClient) {
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


    logout()
    {
      const httpOptions = {
        withCredentials: true,
        headers: new HttpHeaders({ 
          'Content-Type': 'application/json',
          'charset': 'UTF-8',
      
          })
      };
      this.http.delete(this.base_url + '/logout', httpOptions).subscribe(
        {
          next: (response) => 
          {
            const res = JSON.stringify(response)
  
            let resp = JSON.parse(res)
  
            console.log('response is')
            console.log(resp)
                        
            this.checkResponse(resp.login);
          },
          error: (error) => 
          {
            console.error(error);
          },
        }
      );
      
    }
  
    //check value retunred from the backend response, not sure if else condition works
    checkResponse(response: boolean)//, route: ActivatedRouteSnapshot, state : RouterStateSnapshot)
    {

    }
}
