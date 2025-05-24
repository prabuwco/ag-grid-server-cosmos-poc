@NgModule({
    declarations: [AgGridComponent],
    imports: [CommonModule, AgGridModule.withComponents([]), HttpClientModule],
    exports: [AgGridComponent]
  })
  export class AgGridSharedModule {}