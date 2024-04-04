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
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Device {
  name: string;
  devEUI: string;
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
  ],
})
export class ApplicationPageComponent {
  base_url: string = 'http://localhost:5000';
  deviceList: Device[] = [];

  routerLinkVariable = '/hi';
  devices: string[] = [];
  appName: string | null = 'Cat Chairs';
  appId: string | null = '';
  orgId: string | null = '';
  appDescription: string | null =
    "These devices consists of the best possible devices made for cat patting, for the best of cats out there. Don't let your feline friend down, get them feline great with these devices below.";
  imgName: string | null = 'placeholder_cat2';
  removeApps: boolean = false;
  currentPage: number = 0;
  deviceSource = new MatTableDataSource(this.deviceList);

  @ViewChild('devicePaginator', { static: true })
  devicePaginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );

  constructor(private route: ActivatedRoute, private http: HttpClient) {} //makes an instance of the router
  ngOnInit(): void {
    this.appId = this.route.snapshot.paramMap.get('app'); //From the current route, get the route name, which should be the identifier for what you need to render.
    this.orgId = this.route.snapshot.paramMap.get('org');
    if (this.appId == null) {
      this.appName = 'Cat Patting';
    }

    const param = new HttpParams().set(
      'app',
      this.appId != null ? this.appId : '-1'
    );

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
        },
        error: (error) => {
          console.error(error);
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
          }
        },
        error: (error) => {
          console.error(error);
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

  handlePageEvent(pageEvent: PageEvent, pageType: number) {
    //Make get request here that sends in pageEvent.pageIndex
  }
}
