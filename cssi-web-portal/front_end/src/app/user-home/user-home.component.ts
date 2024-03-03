import { Component, OnInit, inject } from '@angular/core';
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
import { Observable, map, shareReplay } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { HomeValues } from '../data.config';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatDividerModule } from '@angular/material/divider';

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
    MatButtonModule,
    MatDividerModule,
    TempNavBarComponent,
  ],
})
export class UserHomeComponent implements OnInit {
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

  result = JSON.stringify(this.data); //Example working with JSON
  info = JSON.parse(this.result);

  newData = this.info[0].name;

  userName: string | null = '';
  routerLinkVariable = 'hi';

  constructor(private route: ActivatedRoute) {} //makes an instance of the router
  ngOnInit(): void {
    this.userName = this.route.snapshot.paramMap.get('user'); //From the current route, get the route name, which should be the identifier for what you need to render.
    console.log(this.userName);
    if (this.userName == null) {
      this.userName = 'John';
    }
    this.setupExampleLists();
  }

  private breakpointObserver = inject(BreakpointObserver);

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );

  setupExampleLists() {
    for (let i = 1; i <= 14; i++) {
      this.notifications.push('Notification ' + i);
      this.ownedOrgs.push('Owned Organization ' + i);
      this.joinedOrgs.push('Joined Organization ' + i);
      this.favDevices.push('Favorite Device ' + i);
    }
  }
}
