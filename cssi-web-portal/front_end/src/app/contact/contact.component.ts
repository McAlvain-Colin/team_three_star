import { Component } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { DashboardNavComponent } from '../dashboard-nav/dashboard-nav.component';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    FormsModule,
    MatTableModule,
    DashboardNavComponent,
    TempNavBarComponent,
  ],
})
export class ContactComponent {}
