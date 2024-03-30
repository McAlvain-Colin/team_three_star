import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
  AfterContentChecked
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
import { HomeValues } from '../data.config';
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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';


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
export class UserHomeComponent implements OnInit, AfterContentChecked {

  base_url: string = 'http://localhost:5000';

  data: HomeValues[] = [
    {
      name: 'Item 1',
      description: 'Description 1',
      link: 'Item 1',
    },
    {
      name: 'Item 2',
      description: 'Description 2',
      link: 'Item 2',
    },
    {
      name: 'Item 3',
      description: 'Description 3',
      link: 'Item 3',
    },
  ];

  notifications: string[] = [];
  ownedOrgs: string[] = [];
  joinedOrgs: string[] = [];
  favDevices: string[] = [];
  menuItems = ['Organization', 'Devices'];
  removeOrgs: boolean = false;
  currentPage: number = 0;
  ownedOrgSource = new MatTableDataSource(this.ownedOrgs);
  joinedOrgSource = new MatTableDataSource(this.joinedOrgs);
  favDeviceSource = new MatTableDataSource(this.favDevices);

  result = JSON.stringify(this.data); //Example working with JSON
  info = JSON.parse(this.result);

  newData = this.info[0].name;

  userName: string | null = '';
  routerLinkVariable = 'hi';

  private breakpointObserver = inject(BreakpointObserver);

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

  constructor(private route: ActivatedRoute, public dialog: MatDialog, private http: HttpClient, private changeDetector: ChangeDetectorRef) {} //makes an instance of the router alsoe creates aaa hhhttp object to use for Requests to backend
  ngOnInit(): void {


    this.http.get(this.base_url + '/userOwnedOrgList', {observe: 'response', responseType: 'json'})
    .subscribe({
      next: (response) => {

        const res = JSON.stringify(response);

        let resp = JSON.parse(res);

        console.log('resp is ');

        console.log(resp);
        console.log('body', resp.body.list)

        for(var i = 0; i  < resp.body.list.length; i++)
        {
          console.log('index: ', resp.body.list[i].name)
          this.ownedOrgs.push(resp.body.list[i].name);


        }



      },
      error: (error) => {
        console.error(error);
      },
    });





    this.http.get(this.base_url + '/userJoinedOrgList', {observe: 'response', responseType: 'json'})
    .subscribe({
      next: (response) => {

        const res = JSON.stringify(response);

        let resp = JSON.parse(res);

        console.log('resp is ');

        console.log(resp);
        console.log('body', resp.body.list)

        for(var i = 0; i  < resp.body.list.length; i++)
        {
          console.log('index: ', resp.body.list[i].name)
          this.joinedOrgs.push(resp.body.list[i].name + ' Description: ' + resp.body.list[i].description);


        }



      },
      error: (error) => {
        console.error(error);
      },
    });

    



    this.userName = this.route.snapshot.paramMap.get('user'); //From the current route, get the route name, which should be the identifier for what you need to render.
    if (this.userName == null) {
      this.userName = 'John';
    }
    // this.setupExampleLists();
    this.ownedOrgSource.paginator = this.ownedOrgPaginator;
    this.joinedOrgSource.paginator = this.joinedOrgPaginator;
    this.favDeviceSource.paginator = this.favDevicePaginator;
  }

  ngAfterContentChecked(): void 
  {
    this.changeDetector.detectChanges()
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
  confirmRemoval(itemName: string, orgID?: number, userID?: number) {
    //SHould open a snackbar that asks if you want to remove the component, and then based on the action does the thing
    const removalDialogRef = this.dialog.open(RemovalDialogComponent, {
      data: { itemName: itemName }, //Can pass in more data if needed so that we can trigger the delete with orgID and userID
    });
  }

  getRouteName(itemName: string, itemType: number) {
    if (itemType == 0) {
      let routeName: string = '/organization/' + itemName;
      return routeName;
    } else if (itemType == 1) {
      let routeName: string = '/device/' + itemName;
      return routeName;
    }
    return null;
  }

  setupExampleLists() {
    for (let i = 1; i <= 14; i++) {
      this.notifications.push('Notification ' + i);
      this.ownedOrgs.push('Owned Organization ' + i);
      this.joinedOrgs.push('Joined Organization ' + i);
      this.favDevices.push('Favorite Device ' + i);
    }
  }
}
