import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionViewComponent } from './prescription-view.component';

describe('PrescriptionViewComponent', () => {
  let component: PrescriptionViewComponent;
  let fixture: ComponentFixture<PrescriptionViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrescriptionViewComponent]
    });
    fixture = TestBed.createComponent(PrescriptionViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
