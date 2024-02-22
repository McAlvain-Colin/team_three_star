import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent, appInterceptor } from './login/login.component';
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
import { DataStatsService } from 'src/charts/data-stats.service';
import { DatePicker } from './date-picker/date-picker.component';
import { OrganizationPageComponent } from './organization-page/organization-page.component';
import { UserPageComponent } from './user-page/user-page.component';
import { DeviceDataComponent } from './device-data/device-data.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [AppComponent, UserPageComponent],
  imports: [
    BrowserAnimationsModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    BrowserModule,
    RouterModule,
    BrowserAnimationsModule,
    LeafletModule,
    AboutComponent,
    ContactComponent,
    HomeComponent,
    ResetPasswordComponent,
    DeviceMapComponent,
    DeviceTableComponent,
    DashboardComponent,
    DeviceDataComponent,
    DeviceStatsComponent,
    MaterialModule,
    AppRoutingModule,
    LoginComponent,
    SignUpComponent,
    ToolBarComponent,
    ForgottenPasswordComponent,
    TempNavBarComponent,
    DatePicker,
    OrganizationPageComponent,
<<<<<<< HEAD
  ],
  providers: [ChartService, DeviceDataService, DataStatsService],
=======
    HttpClientModule
  ],
  providers: [ChartService, DeviceDataService, DataStatsService, {provide: HTTP_INTERCEPTORS, useClass: appInterceptor, multi: true} ],
>>>>>>> David_Vargas
  bootstrap: [AppComponent],
})
export class AppModule {}