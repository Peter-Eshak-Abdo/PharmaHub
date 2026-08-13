import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProfilesRoutingModule } from './profiles-routing.module';
import { PatientProfileComponent } from './patient-profile/patient-profile.component';
import { DoctorListComponent } from './doctor-list/doctor-list.component';
import { DoctorDetailComponent } from './doctor-detail/doctor-detail.component';
import { DoctorProfileComponent } from './doctor-profile/doctor-profile.component';

@NgModule({
  declarations: [
    PatientProfileComponent,
    DoctorListComponent,
    DoctorDetailComponent,
    DoctorProfileComponent
  ],
  imports: [
    CommonModule,
    ProfilesRoutingModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ProfilesModule { }
