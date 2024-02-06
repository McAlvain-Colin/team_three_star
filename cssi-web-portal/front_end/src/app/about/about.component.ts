///* artifact and will be replaced*/
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatGridListModule } from '@angular/material/grid-list';



@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    FormsModule,
    DashboardNavComponent,
    TempNavBarComponent,
    MatGridListModule,
  ],
})
export class AboutComponent {
  currentDate: Date = new Date();
}