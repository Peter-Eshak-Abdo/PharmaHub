import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescriptionFormComponent } from './prescription-form.component';

describe('PrescriptionFormComponent', () => {
  let component: PrescriptionFormComponent;
  let fixture: ComponentFixture<PrescriptionFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PrescriptionFormComponent]
    });
    fixture = TestBed.createComponent(PrescriptionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
