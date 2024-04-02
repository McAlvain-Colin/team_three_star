import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { OnInit } from '@angular/core';
import { ApiService } from '../api.service'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { MatTableModule }  from '@angular/material/table';
import { HttpClient, HttpParams } from '@angular/common/http';

//testing the inteface as a solution next to several individual declations
export interface SensorData {
  dev_eui: any;
  dev_time: any; 
  payload_dict: any; 
  metadata_dict: any;
  payloadColumns: any;
  metadataColumns: any;
}


export interface Device{
  name: string,
  devEUI: string 
}

@Component({
  selector: 'app-filter-page',
  templateUrl: './filter-page.component.html',
  styleUrls: ['./filter-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatGridListModule,
    MatCardModule,
    MatExpansionModule,
    MatRadioModule,
    TempNavBarComponent,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    NgFor,
    MatTableModule,  
  ],
})
export class FilterPageComponent implements OnInit{
  base_url: string = 'http://localhost:5000';
  deviceList: Device[] = []


  // Declared variables. Currently has duplicates until the better method is determined. 
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

  appId: string|null = '' //used to send appId to the db and retrieve all devEUIs associated with app

  constructor(private apiService: ApiService, private route: ActivatedRoute, private http: HttpClient)  { }

  add_device(): void {
    this.apiService.getData().subscribe({
      
    })
  
  }
  
  //when this page is initiated, get data from the apiService. Should connect to back end an get data from database.
  //currently hard coded until I learn how to send data back to backend so I can get data other than lab_sensor_json
  //itterating code to try and get the data in a formate I can use.
  ngOnInit(): void {



    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.



    const param = new HttpParams().set('app', this.appId != null ? this.appId : '-1');

    this.http.get(this.base_url + '/userOrgAppDeviceList', {observe: 'response', responseType: 'json', params: param})
    .subscribe({
      next: (response) => {

        const res = JSON.stringify(response);

        let resp = JSON.parse(res);

        for(var i = 0; i < resp.body.list.length; i++)
        {
          console.log('index on filter is : ', resp.body.list[i].name)
          this.deviceList.push({name: resp.body.list[i].name, devEUI: resp.body.list[i].dev})
        }

      },
      error: (error) => {
        console.error(error);
      },
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



