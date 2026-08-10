import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProductsComponent } from './products/products.component';
import { WeeklyAvailabilityComponent } from './features/availability/weekly-availability/weekly-availability.component';
import { ScheduleExceptionsComponent } from './features/availability/schedule-exceptions/schedule-exceptions.component';

@NgModule({
  declarations: [
    AppComponent,
    ProductsComponent,
    WeeklyAvailabilityComponent,
    ScheduleExceptionsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }