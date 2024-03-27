import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { DataLayout } from '../data.config';
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
    TempNavBarComponent,
    DeviceMapComponent,
    MatDialogModule,
    RemovalDialogComponent,
  ],
})
export class OrganizationPageComponent {
  orgId: number = 0;
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
  appsSource = new MatTableDataSource(this.applications);
  memberSource = new MatTableDataSource(this.members);

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

  constructor(private route: ActivatedRoute, public dialog: MatDialog) {} //makes an instance of the router
  ngOnInit(): void {
    this.orgName = this.route.snapshot.paramMap.get('org'); //From the current route, get the route name, which should be the identifier for what you need to render.
    console.log(this.orgName);
    if (this.orgName == null) {
      this.orgName = 'Cat Chairs';
    }
    this.setupLists();
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

  confirmRemoval(itemName: string) {
    //SHould open a snackbar that asks if you want to remove the component, and then based on the action does the thing
    const removalDialogRef = this.dialog.open(RemovalDialogComponent, {
      data: { itemName: itemName }, //Can pass in more data if needed so that we can trigger the delete with orgID and userID
    });
  }

  getRouteName(itemName: string, itemType: number) {
    let routeName: string = '/application/' + itemName;
    return routeName;
  }

  setupLists() {
    for (let i = 1; i <= 10; i++) {
      this.applications.push('Application ' + i);
      this.members.push('Member ' + i);
    }
  }
}
