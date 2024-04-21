import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { DeviceMapComponent } from '../device-map/device-map.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';


import { MatRadioModule } from '@angular/material/radio';
import { OnInit } from '@angular/core';
import { ApiService } from '../api.service'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MatTableModule }  from '@angular/material/table';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

//using code from the filter page here since it is essentiall the same
//I want to redo this code if theres time using the pageinate module. 
//Requires data rework and I dont wanna break it yet.
export interface SensorData {
  dev_eui: any;
  dev_time: any; 
  payload_dict: any; 
  metadata_dict: any;
  payloadColumns: any;
  metadataColumns: any;
}

@Component({
  selector: 'app-device-page',
  templateUrl: './device-page.component.html',
  styleUrls: ['./device-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatGridListModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    TempNavBarComponent,
    DeviceMapComponent,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    NgFor,
    MatTableModule, 
  ],
})
export class DevicePageComponent implements OnInit{
  private breakpointObserver = inject(BreakpointObserver);

  // I need to reimpliment this but the code seems to reject it will the onInit
  // isHandset$: Observable<boolean> = this.breakpointObserver
  //   .observe(Breakpoints.Handset)
  //   .pipe(
  //     map((result) => result.matches),
  //     shareReplay()
  //   );

  panelOpenState = false;

  dev_eui: any[] = []; //Property to hold the device id
  dev_time: any[] = []; //Property to hold to hold the data time stamp
  records: any[] = []; //Property to hold the full JSON record
  payloadData: any[] = []; //Property to hold the payloadData JSON record
  metadataData: any[] = []; //Property to hold the metadataData JSON record
  recordsFilter: string = ''; // Property to hold the payload filter query
  payloadFilter: string = ''; // Property to hold the payload filter query
  metadataFilter: string = ''; // Property to hold the metadata filter query
  payloadColumns: string[] = [];  // Property to hold the 
  metadataColumns: string[] = [];  // Property to hold the
  displayedPayloadColumns: string[] = [];  // Property to hold the
  displayedMetadataColumns: string[] = [];  // Property to hold the



  appId: string | null = '';
  devName: string | null = '';
  base_url: string = 'http://localhost:5000';
  deviceEUI:string = ''


  constructor(private apiService: ApiService, private route: ActivatedRoute, private http: HttpClient,     private snackBar: MatSnackBar  ) { }
  

  //when this page is initiated, get data from the apiService. Should connect to back end an get data from database.
  //currently hard coded until I learn how to send data back to backend so I can get data other than lab_sensor_json
  //itterating code to try and get the data in a formate I can use.
  ngOnInit(): void {

    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.devName = this.route.snapshot.paramMap.get('dev');

    const param = new HttpParams().set('app', this.appId != null ? this.appId : '-1').set('devName', this.devName != null ? this.devName : 'none');



    // this is for giving one device EUI from the given dev name from the user.
    this.http.get(this.base_url + '/userOrgAppDevice', {observe: 'response', responseType: 'json', params: param})
    .subscribe({
      next: (response) => {

        const res = JSON.stringify(response);

        let resp = JSON.parse(res);

        console.log('resp is in app page', resp.body.dev_eui);
        this.deviceEUI = resp.body.dev_eui;


      },
      error: (error: HttpErrorResponse) => {

        const message = error.error.errorMessage;
        this.snackBar.open(message, 'Close', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        
      }
    });
 




    this.apiService.getData().subscribe({
      next: (data: SensorData[]) => {
        this.records = data.map((item: SensorData) => ({
          dev_eui: item.dev_eui,
          dev_time: item.dev_time,
          payload_dict: JSON.parse(item.payload_dict),
          metadata_dict: JSON.parse(item.metadata_dict)
        }));
        if (this.records.length > 0) {        
          //finding column values for all data types
          this.payloadColumns = Object.keys(this.records[0].payload_dict);
          this.metadataColumns = Object.keys(this.records[0].metadata_dict);
          
          //concating all columns together
          this.displayedPayloadColumns = ['Dev_eui', 'Dev_time'].concat(this.payloadColumns);
          this.displayedMetadataColumns = ['Dev_eui', 'Dev_time'].concat(this.metadataColumns);
        }
      },
      error: (error) => {
        console.error('Error: ', error);
      }
    });
  }
  
  //filter function in order to allow users display only realivant data. 
  filterData(data: any[], query: string): any[] {
    if (!query) {
      return data;
    }
    return data.filter(item => 
      Object.keys(item).some(key =>
        item[key].toString().toLowerCase().includes(query.toLowerCase())
      )
    );
  }
}
