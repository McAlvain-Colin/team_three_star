///* artifact and will be replaced*/
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';



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
    CommonModule,
  ],
})
export class AboutComponent {
  team_images = [
    { url: '../../assets/Colin.jpg', alt: 'Colin McAlvain'},
    { url: '../../assets/David.jpg', alt: 'David Vargas'},
    { url: '../../assets/Huy.jpg', alt: 'Huy Tran'},
  ];
  professor_images = [
    { url: '../../assets/Colin.jpg', alt: 'David Feil-Seifer'},
    { url: '../../assets/David.jpg', alt: 'Devrin Lee'},
    { url: '../../assets/Huy.jpg', alt: 'Sara Davis'},
  ];
  advisor_image = [
    { url: '../../assets/zach.png', alt: 'Dr. Dascalu '},
    { url: '../../assets/zach.png', alt: 'Zach Estreito'},
    { url: '../../assets/Colin.jpg', alt: 'Vinh Le'},
  ];
}