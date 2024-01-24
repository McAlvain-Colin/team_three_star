import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ToolBarComponent } from '../tool-bar/tool-bar.component';
import { TempNavBarComponent } from '../temp-nav-bar/temp-nav-bar.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [MatButtonModule, ToolBarComponent, TempNavBarComponent],
})
export class HomeComponent {}
