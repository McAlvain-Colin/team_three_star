import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeviceTableComponent } from './device-table/device-table.component';
import { MaterialModule } from './material/material.module';
import { DeviceMapComponent } from './device-map/device-map.component';

@NgModule({
  declarations: [
    AppComponent,
    DeviceTableComponent,
    DeviceMapComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
