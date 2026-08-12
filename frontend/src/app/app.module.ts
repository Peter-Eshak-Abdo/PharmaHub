import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { JsonPipe } from "@angular/common"
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PrescriptionFormComponent } from './features/medical/prescription-form/prescription-form.component';
import { PrescriptionViewComponent } from './features/medical/prescription-view/prescription-view.component';
import { CatalogManagementComponent } from './features/medical/catalog-management/catalog-management.component';
import { MedicalHistoryComponent } from './features/medical/medical-history/medical-history.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    // PrescriptionFormComponent,
    // PrescriptionViewComponent,
    // CatalogManagementComponent,
    // MedicalHistoryComponent,
    // NavbarComponent,
  ],
  imports: [
    // JsonPipe,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    // CoreModule,
    SharedModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
