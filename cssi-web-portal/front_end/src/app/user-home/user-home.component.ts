import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  AfterContentChecked,
} from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  Observable,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { Organization } from '../data.config';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RemovalDialogComponent } from '../removal-dialog/removal-dialog.component';
import {
  MatPaginator,
  MatPaginatorIntl,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { TimerService } from '../login/login.component';

@Component({
  selector: 'app-user-home',
  templateUrl: './user-home.component.html',
  styleUrls: ['./user-home.component.css'],
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatToolbarModule,
    MatBadgeModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTabsModule,
    MatTreeModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule,
    MatDividerModule,
    MatPaginatorModule,
    TempNavBarComponent,
  ],
})
//The UserHomeComponent requests information from the backend with http requests to get user related information such as owned and joined orgs.
//The received data is then assigned to the proper variables and data sources for pagination, which is outputted to the HTML.
export class UserHomeComponent implements OnInit, AfterContentChecked {
  base_url: string = 'http://localhost:5000';
  notifications: string[] = [];
  ownedOrgs: Organization[] = [];
  joinedOrgs: Organization[] = [];
  favDevices: Organization[] = [];
  menuItems = ['Organization', 'Devices'];
  removeOrgs: boolean = false;
  currentPage: number = 0;
  ownedOrgSource = new MatTableDataSource(this.ownedOrgs);
  joinedOrgSource = new MatTableDataSource(this.joinedOrgs);
  favDeviceSource = new MatTableDataSource(this.favDevices);

  userName: string | null = '';
  routerLinkVariable = 'hi';

  private breakpointObserver = inject(BreakpointObserver);

  //Calls the paginator from the HTML and sets it to be static so it doesn"t constantly load and break the page.
  @ViewChild('ownedOrgPaginator', { static: true })
  ownedOrgPaginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );
  @ViewChild('joinedOrgPaginator', { static: true })
  joinedOrgPaginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );
  @ViewChild('favDevicePaginator', { static: true })
  favDevicePaginator: MatPaginator = new MatPaginator(
    new MatPaginatorIntl(),
    ChangeDetectorRef.prototype
  );

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    public dialog: MatDialog,
    private http: HttpClient,
    private changeDetector: ChangeDetectorRef,
    private timerService: TimerService,
    private snackBar: MatSnackBar
  ) {} //makes an instance of the router alsoe creates aaa hhhttp object to use for Requests to backend
  ngOnInit(): void {

    // GET request to the userOwnedOrgList route. The .subscribe() method is used to handle the response from the server. It takes an object with two callback functions: next and error.nside the next callback: A new instance of MatTableDataSource is created with the response.body?.list data, 
    // which is the array of organizations returned from the server. The this.ownedOrgSource.paginator property is assigned the this.ownedOrgPaginator object. 
    // Inside the error callback, an error message from the server (error.error.errorMessage)
    this.http
      .get<{ list: Organization[] }>(this.base_url + '/userOwnedOrgList', {
        observe: 'response',
        responseType: 'json',
      })
      .subscribe({
        next: (response) => {
          

          this.ownedOrgSource = new MatTableDataSource(response.body?.list);
          this.ownedOrgSource.paginator = this.ownedOrgPaginator;
        },
        error: (error: HttpErrorResponse) => {
          const message = error.error.errorMessage;
          this.snackBar.open(message, 'Close', {
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
        },
      });

    // GET request to the userJoinedOrgList route. The .subscribe() method is used to handle the response from the server. It takes an object with two callback functions: next and error. 
    // The next callback function is executed when the server responds with a successful HTTP status code. A new instance of MatTableDataSource is created with the response.body?.list data, which is the array of joined organizations returned from the server. The this.joinedOrgSource.paginator property is assigned the this.joinedOrgPaginator object.  The error callback function is executed when the server responds with an error HTTP status code. 
    // Inside the error callback, if the error status code is not 422 (Unprocessable Entity), an error message from the server 
    this.http
      .get<{ list: Organization[] }>(this.base_url + '/userJoinedOrgList', {
        observe: 'response',
        responseType: 'json',
      })
      .subscribe({
        next: (response) => {
          

          this.joinedOrgSource = new MatTableDataSource(response.body?.list);
          this.joinedOrgSource.paginator = this.joinedOrgPaginator;
        },
        error: (error: HttpErrorResponse) => {
          if (error.status != 422) {
            const message = error.error.errorMessage;
            this.snackBar.open(message, 'Close', {
              horizontalPosition: 'center',
              verticalPosition: 'top',
            });
          }
        },
      });

    this.userName = this.route.snapshot.paramMap.get('user'); //From the current route, get the route name, which should be the identifier for what you need to render.
    if (this.userName == null) {
      this.userName = 'John';
    }
    // this.setupExampleLists();
    this.favDeviceSource.paginator = this.favDevicePaginator;
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  handlePageEvent(pageEvent: PageEvent, pageType: number) {
    //Make get request here that sends in pageEvent.pageIndex
  }

  //For removal, we use put in order to update the status of the org with a boolean.
  //Opens the dialog component when called and pases in the correct value to remove the respective item.
  confirmRemoval(
    itemType: number,
    removeOrg?: Organization,
    removeFav?: string
  ) {
    if (itemType == 0) {
      const removalDialogRef = this.dialog.open(RemovalDialogComponent, {
        data: {
          itemName: removeOrg?.name,
          itemId: removeOrg?.o_id,
          itemType: itemType,
        }, //Can pass in more data if needed, and also can do || to indicate that another variable can replace this, in case you want to remove fav devices from users.
      });
    } else if (itemType == 1) {
      const removalDialogRef = this.dialog.open(RemovalDialogComponent, {
        data: {
          itemName: removeFav,
          itemType: itemType,
        }, //Can pass in more data if needed, and also can do || to indicate that another variable can replace this, in case you want to remove fav devices from users.
      });
    }
  }

  //getRouteName returns a respective string that relates to the requested route.
  getRouteName(itemType: number, org?: Organization) {
    //Can add device? for when routing to devices
    if (itemType == 0) {
      let routeName: string = '/organization/' + org?.o_id;
      return routeName;
    } else if (itemType == 1) {
      let routeName: string = '/device/' + org?.o_id;
      return routeName;
    }
    return null;
  }

  logout() {
    this.timerService.logout();
  }

  //
}
