import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule} from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';

import {GMapModule} from 'primeng/gmap';

import { DistanceService } from './services/distance.service';

import {PanelModule} from 'primeng/panel';
import {SliderModule} from 'primeng/slider';
import {RadioButtonModule} from 'primeng/radiobutton';
import {CheckboxModule} from 'primeng/checkbox';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    GMapModule,
    HttpClientModule,
    PanelModule,
    BrowserAnimationsModule,
    SliderModule,
    FormsModule,
    RadioButtonModule,
    CheckboxModule
  ],
  providers: [DistanceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
