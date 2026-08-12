import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MedicalRoutingModule } from './medical-routing.module';
import { CatalogManagementComponent } from './catalog-management/catalog-management.component';
import { PrescriptionFormComponent } from './prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './prescription-view/prescription-view.component';
import { MedicalHistoryComponent } from './medical-history/medical-history.component';

@NgModule({
  declarations: [
    CatalogManagementComponent,
    PrescriptionFormComponent,
    PrescriptionViewComponent,
    MedicalHistoryComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MedicalRoutingModule,
  ],
})
export class MedicalModule {}
