import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
//import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import  'ag-grid-lib';
import { HttpClientModule } from '@angular/common/http';

// Removed AG Grid Enterprise Module Registration from here
// import { ModuleRegistry } from 'ag-grid-community';
// import { ServerSideRowModelModule } from 'ag-grid-enterprise';
// ModuleRegistry.registerModules([ServerSideRowModelModule]);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
   AgGridLibModule, // The library now handles its own AG Grid module registration
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }