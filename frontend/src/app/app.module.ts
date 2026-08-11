import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ProfilesModule } from './features/profiles/profiles.module';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ProfilesModule,
    AppRoutingModule
   
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
