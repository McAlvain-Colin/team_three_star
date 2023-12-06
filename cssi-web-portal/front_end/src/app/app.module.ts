import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgottenPasswordComponent } from './forgotten-password/forgotten-password.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DeviceMapComponent } from './device-map/device-map.component';
import { DeviceTableComponent } from './device-table/device-table.component';
import { MaterialModule } from './material/material.module';
import { ChartService } from './chart.service';
import { DeviceDataService } from '../charts/device-data.service';
import { DeviceStatsComponent } from './device-stats/device-stats.component';
import { TempNavBarComponent } from './temp-nav-bar/temp-nav-bar.component';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
imort { sign}

@NgModule({
<<<<<<< HEAD
  declarations: [
    AppComponent, 
    AboutComponent, 
    ContactComponent, 
    HomeComponent, 
    SignInComponent,
    ResetPasswordComponent,
    DeviceMapComponent,
    DeviceTableComponent,
    DashboardComponent,
    DeviceDataComponent,
    DeviceStatsComponent,
  ],

=======
  declarations: [AppComponent,],
>>>>>>> 4db7d584 (Have the device data section importing devices and data. Need the chart to work next.)
  imports: [
    MaterialModule,
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LoginComponent,
    SignUpComponent,
    ToolBarComponent,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    ForgottenPasswordComponent,
    TempNavBarComponent,
    ResetPasswordComponent,
    MaterialModule,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    DeviceMapComponent,
    DeviceTableComponent,
    DeviceStatsComponent,
<<<<<<< HEAD
    LeafletModule
    
=======
    DashboardComponent
>>>>>>> 4db7d584 (Have the device data section importing devices and data. Need the chart to work next.)
  ],
  providers: [ChartService, 
              DeviceDataService],
  bootstrap: [AppComponent],
})
export class AppModule {}
