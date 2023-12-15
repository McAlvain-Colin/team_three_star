//created by angular
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMapComponent } from './device-map.component';

describe('DeviceMapComponent', () => {
  let component: DeviceMapComponent;
  let fixture: ComponentFixture<DeviceMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [DeviceMapComponent]
});
    fixture = TestBed.createComponent(DeviceMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
