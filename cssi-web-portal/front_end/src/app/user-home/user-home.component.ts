import { Component, OnInit, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
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
  private breakpointObserver = inject(BreakpointObserver);
  constructor(public router: Router) {} //makes an instance of the router
  ngOnInit() {}

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

  links = ['link1', 'link2', 'link3', 'link4', 'link5', 'link6', 'link7'];
  menuItems = ['Organization', 'Devices'];

  result = JSON.stringify(this.data);
  info = JSON.parse(this.result);

  newData = this.info[0].name;

  routerLinkVariable = 'hi';

  //For the toolbar examination
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
}
