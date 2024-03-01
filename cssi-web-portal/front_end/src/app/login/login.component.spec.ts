//created by angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';

// Spec.ts is a testing component that is automatically generated for an angular component, and the team has not modified these files.

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoginComponent],
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});