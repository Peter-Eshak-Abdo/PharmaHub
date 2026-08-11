import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrescriptionFormComponent } from './features/medical/prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './features/medical/prescription-view/prescription-view.component';
import { CatalogManagementComponent } from './features/medical/catalog-management/catalog-management.component';
import { MedicalHistoryComponent } from './features/medical/medical-history/medical-history.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent,
    PrescriptionFormComponent,
    PrescriptionViewComponent,
    CatalogManagementComponent,
    MedicalHistoryComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
