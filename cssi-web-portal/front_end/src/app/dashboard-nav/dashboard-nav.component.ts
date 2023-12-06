import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

//The imported libraries are from Angular as well as made components in this project, the break point observer is generated by Anuglar Materials

@Component({
  selector: 'app-dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.css'],
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatIconModule,
    MatListModule,
    FormsModule,
    RouterModule,
    CommonModule,
  ],
})
export class DashboardNavComponent {
  private breakpointObserver = inject(BreakpointObserver);
  darkMode: boolean = false;

  //Huy's attempt to make a global variable with the Input module from Angular to maintain the theme outside of the webpage.
  @Input() darkMode: boolean = false;
  @Output() darkModeChange = new EventEmitter<boolean>();

  // A function for potentially changing the global variable darkMode in order to keep the theming consistent throughout all the pages.
  toggleMode() {
    this.darkMode = !this.darkMode;
    this.darkModeChange.emit(this.darkMode);
  }

  // An observerable generated by angular to check if the user is in handheld mode or not.
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map((result) => result.matches),
      shareReplay()
    );
}