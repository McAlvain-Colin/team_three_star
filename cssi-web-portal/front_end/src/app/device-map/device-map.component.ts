
import { Component, Input, OnInit } from '@angular/core';
import { DeviceElement } from '../dashboard/dashboard.component';
import { MatRippleModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import * as Leaflet from 'leaflet'; 

@Component({
    selector: 'app-device-map',
    templateUrl: './device-map.component.html',
    styleUrls: ['./device-map.component.css'],
    standalone: true,
    imports: [
        MatCardModule,
        MatTableModule,
        MatRippleModule,
        MatButtonModule
    ],
})
export class DeviceMapComponent implements OnInit{
  @Input() deviceList!: DeviceElement[];

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

  ngOnInit()
  {
    this.myMap = Leaflet.map('map').setView([39.1 , -120.05], 9);
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    },).addTo(this.myMap);

    this.addMarkers();
  }

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
      for(let i = 0; i < this.deviceList.length; i++)
      {
        this.sensors[i] = Leaflet.marker(Leaflet.latLng(this.deviceList[i].endDeviceLocation[0], this.deviceList[i].endDeviceLocation[1]), {icon: this.sensorIcon}).addTo(this.myMap).bindPopup("endDevice: " + (this.deviceList[i].endDeviceId.toString()));
      } 
    }
    
  }
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

      for(let i = 0; i < this.deviceList.length; i++)
      {
        this.gateways[i] = Leaflet.circle(Leaflet.latLng(this.deviceList[i].gatewayLocation[0], this.deviceList[i].gatewayLocation[1]), {radius: 3500}).addTo(this.myMap).bindPopup("gateway: " + (this.deviceList[i].appId.toString()));
      }
    }
  }

  showDevicesAndGateways()
  {
    if(this.showSensors === false)
    {
      this.showSensors = true;

      for(let i = 0; i < this.deviceList.length; i++)
      {
        this.sensors[i] = Leaflet.marker(Leaflet.latLng(this.deviceList[i].endDeviceLocation[0], this.deviceList[i].endDeviceLocation[1]), {icon: this.sensorIcon}).addTo(this.myMap).bindPopup("endDevice: " + (this.deviceList[i].endDeviceId.toString()));
      } 
    }

    if(this.showGateways === false)
    {
      this.showGateways = true;
      for(let i = 0; i < this.deviceList.length; i++)
      {
        this.gateways[i] = Leaflet.circle(Leaflet.latLng(this.deviceList[i].gatewayLocation[0], this.deviceList[i].gatewayLocation[1]), {radius: 3500}).addTo(this.myMap).bindPopup("gateway: " + (this.deviceList[i].appId.toString()));
      }
    }
    
  }

  flyTo(row: DeviceElement)
  {
    if(this.showSensors === true){
      this.myMap.flyTo(Leaflet.latLng(row.endDeviceLocation[0], row.endDeviceLocation[1]), 11);
    }
    if(this.showGateways === true){
      this.myMap.flyTo(Leaflet.latLng(row.gatewayLocation[0], row.gatewayLocation[1]), 11);
    }
  }
}
