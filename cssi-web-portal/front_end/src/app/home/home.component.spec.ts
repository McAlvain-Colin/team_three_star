//created by angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';

// Spec.ts is a testing component that is automatically generated for an angular component, and the team has not modified these files.

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
