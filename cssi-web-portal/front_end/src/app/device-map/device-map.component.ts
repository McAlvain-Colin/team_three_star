
import { Component, Input, OnInit } from '@angular/core';
// import { locationRecord } from '../dashboard/dashboard.component';
import { MatRippleModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import * as Leaflet from 'leaflet'; 
import { ApiService } from '../api.service'; 
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';

import { MatGridListModule } from '@angular/material/grid-list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { MatRadioModule } from '@angular/material/radio';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgFor } from '@angular/common';
import { DatePicker } from '../date-picker/date-picker.component';
import { saveAs  } from 'file-saver';
import { Chart, registerables } from 'chart.js/auto';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf, PercentPipe } from '@angular/common';
import { FormControl, FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider'
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';

export interface DeviceLocation {
  dev_eui: any;
  latitude: any;
  longitude: any;
  altitude: any;
  type: any;
}

@Component({
    selector: 'app-device-map',
    templateUrl: './device-map.component.html',
    styleUrls: ['./device-map.component.css'],
    standalone: true,
    imports: [
        MatCardModule,
        MatTableModule,
        MatRippleModule,
        MatButtonModule,
        TempNavBarComponent,
        MatPaginatorModule,

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
        MatPaginatorModule,
        DatePicker,
        MatButtonModule,
        NgIf,
        MatProgressSpinnerModule,
        PercentPipe,
        ReactiveFormsModule,
        MatSliderModule,
        MatDatepickerModule,
        MatCheckboxModule,
    ],
})

// theDevice map component will recieve data from the dashboard component using the input decorator and will be placed in the
// variable locationRecord array, there is a declaration of the myMap object which will be used from the map class from the leaflet JS library
// There is the initialization of a sensorIcon object which has attributes which define the image which will be used, image pixel size, coordinates 
// indicating the alignment of the location given for map coordinates, coordinates for the pop up icons which occur also with respect to the map coordinates,
// and pixel size of the for the icon shadow. Boolean variables are also defined for logging what is currently being presented to the user. arrays of type Marker class objects 
// and one for type of class Circle objects. Leaflet Documentation on Icons was found here https://leafletjs.com/examples/custom-icons/
export class DeviceMapComponent implements AfterViewInit{

  constructor(private apiService: ApiService){};

  // @Input() locationRecord!: DeviceLocation[];

  myMap!: Leaflet.Map;
  sensorIcon: Leaflet.Icon<Leaflet.IconOptions>= Leaflet.icon({
    iconUrl: '../assets/sensor.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
  //array to keep map sensor info
  sensors: Leaflet.Marker<any>[] = [];
  gateways: Leaflet.Circle<any>[] = []

  showSensors: boolean = false;
  showGateways: boolean = false;

  locationRecord: DeviceLocation[] = [];
  
// This is a lifecycle hook used by Angular, it allows for defining which properties should be initialized upon when the component is being used,documentation is found here https://angular.io/api/core/OnInit. Here the lifecycle will
// initialize the map by creating a html element with the id = map, the set view method indicates the location coordinates should be displaying in the map. The map will be using OpenStreetMap tile layer which is a geographic database of map
// user contributed tiles,using the URL template to the OpenStreetMap, the x, y indicate the tile coordinates to be used, z indicates the zoom level to be used, s indicates the sub domain to be used. The code was based on the Leaflet documentationfor initialization 
// as well as understanding providing credit for usage of both Leaflet and OpenStreetMap https://leafletjs.com/examples/quick-start/. Upon initialization, markers of all the devices will be displayed. 
  ngOnInit(): void {
    this.apiService.getLocation().subscribe({
      next: (data: any[]) => {
        const locationRecord = data.map((item: any) => ({
          dev_eui: item[0],
          latitude: item[1],
          longitude: item[2],
          altitude: item[3],
          type: item[4],
        }));

        this.locationSource.data = locationRecord;
      },

      error: (error) => {
        console.error('Error: ', error);
      }
    })

    this.myMap = Leaflet.map('map').setView([39.1 , -120.05], 9);
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },).addTo(this.myMap);

    // for(let i = 0; i <  this.locationRecord.length; i++){
    //   if(this.locationRecord[i].type === 'gateway'){
    //     gateways.push
    //   }
    // }

    this.addMarkers();
  }

  @ViewChild('locationPaginator') locationPaginator!: MatPaginator;

  locationSource = new MatTableDataSource<DeviceLocation>([]);

  ngAfterViewInit() {
    this.locationSource.paginator = this.locationPaginator;
  }
  
// addMarkers method will check if gateways are being displayed, if they are, the boolean value for checking gateway visibility is changed to false, the gateways icons previously added will be removed from the map and the array containing the gateway icons. 
// if the end devices sensors are not being displayed, then the method will places the sensor icons using the marker function from Leaflet JS, which are created using the end device locations retrieved from the current selected device from the device list and will be placed on top of the map layer, 
// and also add sensor popup icons depending on if the user clicks on the end device icon which as been added to the map. This was built using the marker documentation on Leaflet https://leafletjs.com/reference.html#marker
  addMarkers(): void
  {

    if(this.showGateways === true)
    {
      this.showGateways = false;
      for(let i = this.gateways.length -1; i >= 0; i--)
      {
        this.gateways[i].removeFrom(this.myMap);
        this.gateways.pop();
      } 
    }
    
    if(this.showSensors === false)
    {
      this.showSensors = true;
      //placing all sensor locations in an array to be used later to delete if view gateways is called as well as placing the sensors into the leaflet map
      console.log(this.locationRecord.length)
      for(let i = 0; i < this.locationRecord.length; i++)
      {
        this.sensors[i] = Leaflet.marker(Leaflet.latLng(this.locationRecord[i].latitude, this.locationRecord[i].longitude), {icon: this.sensorIcon}).addTo(this.myMap).bindPopup("endDevice: " + (this.locationRecord[i].dev_eui.toString()));
      } 
    }
    
  }

// ShowGatewayRanges method will check if end device icons are being displayed, if they are, the boolean value for tracking end devices is changed to false, the end device sensor icons previously added will be removed from the map and the array containing the end device sensor icons. 
// if the gateways are not being displayed, then the method will places the gateway polygons using the circle method from the Leaflet JS, which are created using the gateway locations retrieved from the current selected device from the device list and will be placed on top of the map layer using methods from Leaflet JS library, 
// and also add gateway popup icons with EUI and depending on if the user clicks on any one of the gateway polygon which as been added to the map. The circle method comes from the Leaflet JS Documentation provided here: https://leafletjs.com/reference.html#circle
  showGatewayRanges()
  {
    if(this.showSensors === true)
    {
      for(let i = this.sensors.length -1; i >= 0; i--)
      {
        this.sensors[i].removeFrom(this.myMap);
        this.sensors.pop()
      } 
      this.showSensors = false;
    }
    if(this.showGateways === false)
    {
      this.showGateways = true;

      for(let i = 0; i < this.locationRecord.length; i++)
      {
        this.gateways[i] = Leaflet.circle(Leaflet.latLng(this.locationRecord[i].latitude, this.locationRecord[i].longitude), {radius: 3500}).addTo(this.myMap).bindPopup("gateway: " + (this.locationRecord[i].dev_eui.toString()));
      }
    }
  }

// showDevicesAndGateways will check if either types of icons are showing, end device sensors or gateways, if either one isnt displaying, then the method will add the missing type of layer to the map with similar functionality from showGatewayRanges or 
// addMarkers methods above.  
  showDevicesAndGateways()
  {
    if(this.showSensors === false)
    {
      this.showSensors = true;

      for(let i = 0; i < this.locationRecord.length; i++)
      {
        this.sensors[i] = Leaflet.marker(Leaflet.latLng(this.locationRecord[i].latitude, this.locationRecord[i].longitude), {icon: this.sensorIcon}).addTo(this.myMap).bindPopup("endDevice: " + (this.locationRecord[i].dev_eui.toString()));
      } 
    }

    if(this.showGateways === false)
    {
      this.showGateways = true;
      for(let i = 0; i < this.locationRecord.length; i++)
      {
        this.gateways[i] = Leaflet.circle(Leaflet.latLng(this.locationRecord[i].latitude, this.locationRecord[i].longitude), {radius: 3500}).addTo(this.myMap).bindPopup("gateway: " + (this.locationRecord[i].dev_eui.toString()));
      }
    }
    
  }
  
// Flyto method will use the flyto method from the leaflet JS library to indicate that if sensors or gateways are being displayed, then the map will center the map based on the location attributes from the device sent in as a parameter, this implementation was based off the Leaflet documetntation
// here :https://leafletjs.com/reference.html#map-flyto
  flyTo(row: DeviceLocation)
  {
    if(this.showSensors === true){
      this.myMap.flyTo(Leaflet.latLng(row.latitude, row.longitude), 11);
    }
    if(this.showGateways === true){
      this.myMap.flyTo(Leaflet.latLng(row.latitude, row.longitude), 11);
    }
  }
}
