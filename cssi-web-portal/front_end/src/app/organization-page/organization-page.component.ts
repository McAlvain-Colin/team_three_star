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
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Organization, App, Member } from '../data.config';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { SelectionChange } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TimerService } from '../login/login.component';

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
    MatSelectModule,
    MatPaginatorModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatDividerModule,
    TempNavBarComponent,
    DeviceMapComponent,
    MatDialogModule,
    RemovalDialogComponent,
    ConfirmDialogComponent,
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
  selected: number = 0;
  isAdmin: boolean = false;
  userRole: number = 0;
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
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private timerService: TimerService
  ) {} //makes an instance of the router
  ngOnInit(): void {
    this.orgId = this.route.snapshot.paramMap.get('org'); //From the current route, get the route name, which should be the identifier for what you need to render.
    console.log(this.orgId);

    // this is to specify the orgId in the get request using query Parameters
    //  an instance of HttpParams, This sets the org query parameter to the value of this.orgId, which is decoded using decodeURI and converted to a string using String.
    const param = new HttpParams().set('org', decodeURI(String(this.orgId)));

    // GET request to theuserOrgAppList route. The .subscribe() method is used to handle the response from the server. It takes an object with two callback functions: next and error. The next callback function is executed when the server responds with a successful HTTP status code. on next, the for loop will For each application in the list, the following actions are performed:
    // The application name is added to the this.applications array using this.applications.push(resp.body.list[i].name).
    // An object containing the application ID, name, and description is pushed to the this.appList array using this.appList.push({ id: resp.body.list[i].app_id, name: resp.body.list[i].name, description: resp.body.list[i].description }).
    // The this.appsSource.paginator property is assigned the this.appsPaginator object, which is a reference to a pagination component for a table or list.
    this.http
      .get<{ list: Organization }>(this.base_url + '/userOrgAppList', {
        observe: 'response',
        responseType: 'json',
        params: param,
      })
      .subscribe({
        next: (response) => {
          const res = JSON.stringify(response);

          let resp = JSON.parse(res);


          

          for (var i = 0; i < resp.body.list.length; i++) {
            this.applications.push(resp.body.list[i].name);
            this.appList.push({
              id: resp.body.list[i].app_id,
              name: resp.body.list[i].name,
              description: resp.body.list[i].description,
            });
          }
          // this.appsSource = new MatTableDataSource(response.body?.list);
          this.appsSource.paginator = this.appsPaginator;
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });

    // a GET request to the getOrgInfo route, The .subscribe() method is used to handle the response from the server. It takes an object with two callback functions: next and error. The next callback function is executed when the server responds with a successful HTTP status code. The this.orgName property is assigned the value of resp.body.list[0].name, 
    // The this.orgDescription property is assigned the value of resp.body.list[0].description, The this.userRole property is assigned the value of resp.body.list[0].r_id. If the this.userRole is equal to 1, for admin, The this.isAdmin property is set to true.
    // The this.memberSource.data property is assigned the this.memberList array,The this.memberSource.paginator property is assigned the this.membersPaginator object. The error callback function is executed when the server responds with an error HTTP status code and Inside the error callback, an error message from the server. 
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

          

          this.orgName = resp.body.list[0].name;
          this.orgDescription = resp.body.list[0].description;
          this.userRole = Number(resp.body.list[0].r_id);
          if (this.userRole == 1) {
            this.isAdmin = true;
            this.memberSource.data = this.memberList;
            this.memberSource.paginator = this.membersPaginator;
            this.changeDetector.detectChanges();
          }
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });

    // this for getting org members
    //  GET request to the OrgMembers route. The .subscribe() method is used to handle the response from the server. It takes an object with two callback functions: next and error.
    // The next callback function is executed when the server responds with a successful HTTP status code. A for loop iterates over the resp.body.list array and for each member in the list, an object containing the member's ID, name, role, and email is pushed to the this.memberList array. 
    // The this.memberSource.paginator property is assigned the this.membersPaginator object which is a reference to a pagination component
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

          

          for (var i = 0; i < resp.body.list.length; i++) {
            this.memberList.push({
              id: resp.body.list[i].a_id,
              name: resp.body.list[i].name,
              role: resp.body.list[i].r_id,
              email: resp.body.list[i].email,
            });
          }
          this.memberSource.paginator = this.membersPaginator;
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
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

  //This function handles the event where the paginator is clicked< which could be used to paginate data from the backend, but we didn"t implement it that way.
  handlePageEvent(pageEvent: PageEvent, pageType: number) {
    //Make get request here that sends in pageEvent.pageIndex
  }

  //confirmRemoval will check if the type of removal requested and pass the proper information toto the dialog component for removal
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
          memberRole: removeMember?.role,
          itemType: itemType,
        },
      });
    }
  }

  //Similar to confirmRemoval, role change passes in the member information in order to change the role of the member requested
  confirmRoleChange(changeMember: Member, roleEvent: MatSelectChange) {
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        orgId: this.orgId,
        itemName: changeMember.name,
        itemId: changeMember.id,
        roleId: roleEvent.value,
      }, //Can pass in more data if needed, and also can do || to indicate that another variable can replace this, in case you want to remove fav devices from users.
    });
  }

  //When called getRouteName will return a string to the next route for Angular's RouterLink
  getRouteName(app: App) {
    let routeName: string = '/application/' + app.id + '/' + this.orgId;
    return routeName;
  }

  //An old function used to set up placeholder values for testing display of list items in an array.
  setupLists() {
    for (let i = 1; i <= 10; i++) {
      this.applications.push('Application ' + i);
      this.members.push('Member ' + i);
    }
  }
  
  //Calling this function logs out the user while they"re connected to their account.
  logout() {
    this.timerService.logout();
  }
}
