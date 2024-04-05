import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RequestService } from '../request.service';
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
import { RemovalDialogComponent } from '../removal-dialog/removal-dialog.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import {
  _MatTableDataSource,
  MatTableDataSource,
} from '@angular/material/table';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Organization, App, Member } from '../data.config';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-organization-page',
  templateUrl: './organization-page.component.html',
  styleUrls: ['./organization-page.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatPaginatorModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatDividerModule,
    TempNavBarComponent,
    DeviceMapComponent,
    MatDialogModule,
    RemovalDialogComponent,
  ],
})
export class OrganizationPageComponent implements OnInit {
  base_url: string = 'http://localhost:5000';
  appList: App[] = [];
  memberList: Member[] = [];

  orgId: string | null = '';
  routerLinkVariable = '/hi';
  applications: string[] = [];
  members: string[] = [];
  orgName: string | null = 'Cat Chairs';
  orgDescription: string | null =
    'This cat is the sole representative of this company, he watches over the data. If there are any issues that you have with this CEO, please send a request at 1-420-MEOW-MEOW.';
  imgName: string | null = 'placeholder_cat2';
  removeApps: boolean = false;
  removeMembers: boolean = false;
  isAdmin: boolean = true;
  currentPage: number = 0;
  appsSource = new MatTableDataSource(this.appList);
  memberSource = new MatTableDataSource(this.memberList);

  @ViewChild('appsPaginator', { static: true })
  appsPaginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );

  @ViewChild('membersPaginator', { static: true })
  membersPaginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );

  constructor(
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private http: HttpClient
  ) {} //makes an instance of the router
  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get('org'); //From the current route, get the route name, which should be the identifier for what you need to render.
    console.log(this.orgId);
    // if (this.orgName == null) {
    //   this.orgName = 'Cat Chairs';
    // }
    // this.setupLists();

    // this is to specify the orgId in the get request using query Parameters

    const param = new HttpParams().set('org', decodeURI(String(this.orgId)));

    this.http
      .get(this.base_url + '/userOrgAppList', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          // console.log('resp is ');

          // console.log(resp);
          // console.log('body', resp.body.list);

          for (var i = 0; i < resp.body.list.length; i++) {
            // this.applications.push(resp.body.list[i].name);
            this.appList.push({
              id: resp.body.list[i].app_id,
              name: resp.body.list[i].name,
              description: resp.body.list[i].description,
            });
          }
          // console.log('in the app list ')
          // this.appsSource = new MatTableDataSource(response.body?.list);
          this.appsSource.paginator = this.appsPaginator;
        },
        error: (error) => {
          console.error(error);
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

          console.log('resp is ');

          console.log(resp);
          console.log('body', resp.body.list);

          this.orgName = resp.body.list[0].name;
          this.orgDescription = resp.body.list[0].description;
        },
        error: (error) => {
          console.error(error);
        },
      });

    // this for getting org members
    this.http
      .get(this.base_url + '/OrgMembers', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);

          console.log('resp is ');

          console.log(resp);
          console.log('body', resp.body.list);

          for (var i = 0; i < resp.body.list.length; i++) {
            this.memberList.push({
              id: resp.body.list[i].id,
              name: resp.body.list[i].name,
            });

            // add members to the member list
          }
        },
        error: (error) => {
          console.error(error);
        },
      });

    // this is for getting a org's applicatiiions
    this.appsSource.paginator = this.appsPaginator;
    this.memberSource.paginator = this.membersPaginator;
  }

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  handlePageEvent(pageEvent: PageEvent, pageType: number) {
    //Make get request here that sends in pageEvent.pageIndex
  }

  confirmRemoval(itemType: number, removeApp?: App, removeMember?: Member) {
    if (itemType == 3) {
      const removalDialogRef = this.dialog.open(RemovalDialogComponent, {
        data: {
          orgId: this.orgId,
          itemName: removeApp?.name,
          itemId: removeApp?.id,
          itemType: itemType,
        }, //Can pass in more data if needed, and also can do || to indicate that another variable can replace this, in case you want to remove fav devices from users.
      });
    } else if (itemType == 4) {
      const removalDialogRef = this.dialog.open(RemovalDialogComponent, {
        data: {
          orgId: this.orgId,
          itemName: removeMember?.name,
          itemId: removeMember?.id,
          itemType: itemType,
        }, //Can pass in more data if needed, and also can do || to indicate that another variable can replace this, in case you want to remove fav devices from users.
      });
    }
  }

  getRouteName(app: App) {
    let routeName: string = '/application/' + app.id + '/' + String(this.orgId);
    return routeName;
  }

  setupLists() {
    for (let i = 1; i <= 10; i++) {
      this.applications.push('Application ' + i);
      this.members.push('Member ' + i);
    }
  }
}
