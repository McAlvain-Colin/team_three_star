import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatButtonModule } from '@angular/material/button';
import { DeviceMapComponent } from '../device-map/device-map.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';  
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Organization, Device } from '../data.config';
import { MatDialog } from '@angular/material/dialog';
import { RemovalDialogComponent } from '../removal-dialog/removal-dialog.component';
import { TimerService } from '../login/login.component';
import * as Leaflet from 'leaflet';
import { MatRippleModule } from '@angular/material/core';
import { ApiService } from '../api.service';
import { OnInit, Input } from '@angular/core';

export interface DeviceLocation {
  dev_eui: any;
  latitude: any;
  longitude: any;
  altitude: any;
  type: any;
  application: any;
}

@Component({
  selector: 'app-application-page',
  templateUrl: './application-page.component.html',
  styleUrls: ['./application-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatCardModule,
    MatTabsModule,
    MatPaginatorModule,
    MatButtonModule,
    TempNavBarComponent,
    DeviceMapComponent,
    RemovalDialogComponent,
    MatRippleModule,
    MatTableModule,
  ],
})

export class ApplicationPageComponent {
  base_url: string = 'http://localhost:5000';
  deviceList: Device[] = [];

  //chart variables.
  // @Input() Devicelist!: SensorData[];
  @Input() locationRecord!: DeviceLocation[];

  myMap!: Leaflet.Map;
  sensorIcon: Leaflet.Icon<Leaflet.IconOptions> = Leaflet.icon({
    iconUrl: '../assets/sensor.png',
    iconSize: [25, 25],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
  //array to keep map sensor info
  sensors: Leaflet.Marker<any>[] = [];
  gateways: Leaflet.Circle<any>[] = [];

  showSensors: boolean = false;
  showGateways: boolean = false;

  routerLinkVariable = '/hi';
  devices: string[] = [];
  appName: string | null = 'Cat Chairs';
  appId: string | null = '';
  orgId: string | null = '';
  userRole: number = 0;
  appDescription: string | null =
    "These devices consists of the best possible devices made for cat patting, for the best of cats out there. Don't let your feline friend down, get them feline great with these devices below.";
  imgName: string | null = 'placeholder_cat2';
  removeDevices: boolean = false;
  currentPage: number = 0;
  deviceSource = new MatTableDataSource(this.deviceList);

  @ViewChild('devicePaginator', { static: true })
  devicePaginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private timerService: TimerService
  ) {} //makes an instance of the router
  ngOnInit(): void {
    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.orgId = this.route.snapshot.paramMap.get('org');
    if (this.appId == null) {
      this.appName = 'Cat Patting';
    }

    const param = new HttpParams()
      .set('app', this.appId != null ? this.appId : '-1')
      .append('org', this.orgId != null ? this.orgId : '-1');

    // this request is for getting application name, id, and description
    this.http
      .get(this.base_url + '/userOrgApp', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          console.log('resp is in app page', resp);

          this.appName = resp.body.name;
          this.appDescription = resp.body.description;
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });

    this.http
      .get<{ list: Organization }>(this.base_url + '/getOrgInfo', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          this.userRole = Number(resp.body.list[0].r_id);
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });

    // this is for getting the organizations's applications associated with it

    this.http
      .get(this.base_url + '/userOrgAppDeviceList', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          for (var i = 0; i < resp.body.list.length; i++) {
            console.log('index: ', resp.body.list[i].name);
            this.devices.push(resp.body.list[i].name);
            this.deviceList.push({
              name: resp.body.list[i].name,
              devEUI: resp.body.list[i].dev,
            });
            this.deviceSource.data = this.deviceList;
            this.deviceSource.paginator = this.devicePaginator;
          }
          this.getDataSetup();
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });

    this.deviceSource.paginator = this.devicePaginator;
  }

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  setupDevices() {
    for (let i = 1; i <= 10; i++) {
      this.devices.push('Device ' + i);
    }
  }

  getRouteName(device: Device) {
    let routeName: string =
      '/device/' + this.orgId + '/' + this.appId + '/' + device.name;
    return routeName;
  }

  confirmRemoval(itemType: number, removeDevice?: Device) {
    const removalDialogRef = this.dialog.open(RemovalDialogComponent, {
      data: {
        appId: this.appId,
        itemName: removeDevice?.name,
        itemId: removeDevice?.devEUI,
        itemType: itemType,
      }, //Can pass in more data if needed, and also can do || to indicate that another variable can replace this, in case you want to remove fav devices from users.
    });
  }

  handlePageEvent(pageEvent: PageEvent, pageType: number) {
    //Make get request here that sends in pageEvent.pageIndex
  }
  
  logout() {
    this.timerService.logout();
  }

  gAfterViewInit() {
    this.locationSource.paginator = this.locationPaginator;
  }
  @ViewChild('locationPaginator') locationPaginator!: MatPaginator;

  locationSource = new MatTableDataSource<DeviceLocation>([]);

  private getDataSetup(): void {
    this.deviceList.forEach((device, index) => { 
      this.apiService.getDeviceLocation(device.devEUI).subscribe({ 
        next: (data: any[]) => {
          const locationRecord = data.map((item: any) => ({
            dev_eui: item[0],
            latitude: item[1],
            longitude: item[2],
            altitude: item[3],
            type: item[4],
            application: item[5],
          }));
          // console.log('location record: ', locationRecord)

          this.locationSource.data = [...this.locationSource.data, ...locationRecord];
          // this.locationData = this.locationSource.data;

          // console.log("Location Source: ", this.locationSource.data);
          // console.log("Location keys: ", Object.keys(this.locationSource.data));

          // console.log("Location Size: ", this.locationSource.data.length);

          
          // if (this.showSensors === false) {
            // this.showSensors = true;

          for (let i = 0; i < this.locationSource.data.length; i++) {
            if(this.locationSource.data[i].type === 'device') {
              this.sensors[i] = Leaflet.marker(
                Leaflet.latLng(
                  this.locationSource.data[i].latitude,
                  this.locationSource.data[i].longitude,
                  this.locationSource.data[i].altitude,                  
                ),
                { 
                  icon: this.sensorIcon,
                  title: this.locationSource.data[i].application
                }
              )
                .addTo(this.myMap)
                .bindPopup('endDevice: ' + this.locationSource.data[i].dev_eui.toString());
            }
          }
          // }

          // if (this.showGateways === false) {
          //   this.showGateways = true;
          //   for (let i = 0; i < this.locationSource.data.length; i++) {
          //     if(this.locationSource.data[i].type === 'gateway') {
          //       this.gateways[i] = Leaflet.circle(
          //         Leaflet.latLng(
          //           this.locationSource.data[i].latitude,
          //           this.locationSource.data[i].longitude,
          //           this.locationSource.data[i].altitude,
          //         ),
          //         { radius: 25000 }
          //       )
          //         .addTo(this.myMap)
          //         .bindPopup('gateway: ' + this.locationSource.data[i].dev_eui.toString());
          //     }
          //   }
          // }
        },

        error: (error) => {
          console.error('Error: ', error);
        },
      });

      this.myMap = Leaflet.map('map').setView([39.1, -120.05], 9);
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(this.myMap);
    });
  };// ###################################################################################
  

  // ngAfterViewInit() {
  //   this.locationSource.paginator = this.locationPaginator;
  // }

  // addMarkers method will check if gateways are being displayed, if they are, the boolean value for checking gateway visibility is changed to false, the gateways icons previously added will be removed from the map and the array containing the gateway icons.
  // if the end devices sensors are not being displayed, then the method will places the sensor icons using the marker function from Leaflet JS, which are created using the end device locations retrieved from the current selected device from the device list and will be placed on top of the map layer,
  // and also add sensor popup icons depending on if the user clicks on the end device icon which as been added to the map. This was built using the marker documentation on Leaflet https://leafletjs.com/reference.html#marker
  addMarkers(): void {
    console.log('locationData: ',this.locationSource)
    if (this.showGateways === true) {
      this.showGateways = false;
      for (let i = this.gateways.length - 1; i >= 0; i--) {
        this.gateways[i].removeFrom(this.myMap);
        this.gateways.pop();
      }
    }

    if (this.showSensors === false) {
      this.showSensors = true;
      //placing all sensor locations in an array to be used later to delete if view gateways is called as well as placing the sensors into the leaflet map
      console.log(this.locationRecord.length);
      for (let i = 0; i < this.locationRecord.length; i++) {
        this.sensors[i] = Leaflet.marker(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude,
            this.locationRecord[i].altitude
          ),
          { icon: this.sensorIcon }
        )
          .addTo(this.myMap)
          .bindPopup('endDevice: ' + this.locationRecord[i].dev_eui.toString());
      }
    }
  }

  // ShowGatewayRanges method will check if end device icons are being displayed, if they are, the boolean value for tracking end devices is changed to false, the end device sensor icons previously added will be removed from the map and the array containing the end device sensor icons.
  // if the gateways are not being displayed, then the method will places the gateway polygons using the circle method from the Leaflet JS, which are created using the gateway locations retrieved from the current selected device from the device list and will be placed on top of the map layer using methods from Leaflet JS library,
  // and also add gateway popup icons with EUI and depending on if the user clicks on any one of the gateway polygon which as been added to the map. The circle method comes from the Leaflet JS Documentation provided here: https://leafletjs.com/reference.html#circle
  showGatewayRanges() {
    if (this.showSensors === true) {
      for (let i = this.sensors.length - 1; i >= 0; i--) {
        this.sensors[i].removeFrom(this.myMap);
        this.sensors.pop();
      }
      this.showSensors = false;
    }
    if (this.showGateways === false) {
      this.showGateways = true;

      for (let i = 0; i < this.locationRecord.length; i++) {
        this.gateways[i] = Leaflet.circle(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude
          ),
          { radius: 3500 }
        )
          .addTo(this.myMap)
          .bindPopup('gateway: ' + this.locationRecord[i].dev_eui.toString());
      }
    }
  }

  // showDevicesAndGateways will check if either types of icons are showing, end device sensors or gateways, if either one isnt displaying, then the method will add the missing type of layer to the map with similar functionality from showGatewayRanges or
  // addMarkers methods above.
  showDevicesAndGateways() {
    if (this.showSensors === false) {
      this.showSensors = true;

      for (let i = 0; i < this.locationRecord.length; i++) {
        this.sensors[i] = Leaflet.marker(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude
          ),
          { icon: this.sensorIcon}
        )
          .addTo(this.myMap)
          .bindPopup('endDevice: ' + this.locationRecord[i].dev_eui.toString());
      }
    }

    if (this.showGateways === false) {
      this.showGateways = true;
      for (let i = 0; i < this.locationRecord.length; i++) {
        this.gateways[i] = Leaflet.circle(
          Leaflet.latLng(
            this.locationRecord[i].latitude,
            this.locationRecord[i].longitude
          ),
          { 
            radius: 3500, 
            color: '#ff3388',
            fillColor: 'red'
          },
        )
          .addTo(this.myMap)
          .bindPopup('gateway: ' + this.locationRecord[i].dev_eui.toString());
      }
    }
  }

  // Flyto method will use the flyto method from the leaflet JS library to indicate that if sensors or gateways are being displayed, then the map will center the map based on the location attributes from the device sent in as a parameter, this implementation was based off the Leaflet documetntation
  // here :https://leafletjs.com/reference.html#map-flyto
  flyTo(row: DeviceLocation) {
    if (this.showSensors === true) {
      this.myMap.flyTo(Leaflet.latLng(row.latitude, row.longitude), 11);
    }
    if (this.showGateways === true) {
      this.myMap.flyTo(Leaflet.latLng(row.latitude, row.longitude), 11);
    }
  }
}
