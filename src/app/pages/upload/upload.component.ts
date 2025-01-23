import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { MasterService } from '../../services/master.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-upload',
  imports: [FormsModule, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css',
})
export class UploadComponent {
  parsedData: any[] = [];
  errors: string[] = [];
  showEror: boolean = false;
  invalidEmail: string = '';
  invalidPhone : string = '';
  validData: any[]=[];
  constructor(private masterService: MasterService, private route: Router) {}

  onFileSelected(event: any): void {
    debugger;
    console.log(this.parsedData);

    const file = event.target.files[0]; // Get the first file selected

    if (!file) {
      return; // If no file is selected, return early
    }

    // Check if the file is an Excel file (.xlsx or .xls)
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.xlsx', '.xls']; // Array of valid file extensions
    const isValidFile = validExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

    if (isValidFile) {
      // Proceed to read the file if it's a valid Excel fil e
      console.log('Selected file:', file.name);
      this.readFile(file);
    } else {
      // Push error if the file is not a valid Excel file
      this.errors.push('Please upload a valid Excel file (.xlsx or .xls).');
      console.log('Invalid file type:', file.name);
    }
  }

  readFile(file: File): void {
    debugger;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const sheet = workbook.Sheets[sheetName];
      this.parsedData = XLSX.utils.sheet_to_json(sheet);
      console.log('p', this.parsedData);

      // Validate the parsed data
      this.validateData();
    };
    reader.readAsArrayBuffer(file);
  }

  validateData(): void {
    this.errors = [];
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex = /^[0-9]{10}$/; // Assuming phone number is a 10-digit number

    for (let i = 0; i < this.parsedData.length; i++) {
      const row = this.parsedData[i];
      let missingFields = [];
      this.invalidEmail = '';
      this.invalidPhone = '';
      if (!row.Name) {
        missingFields.push('Name');
      }
      if (!row.Email) {
        missingFields.push('Email');
      }else
      if(!emailRegex.test(row.Email)) {
        this.showEror = true;
       this.invalidEmail = `Invalid email format.`;
      }

      if (!row.PhoneNumber) {
        missingFields.push('Phone Number');
      }else
      if (!phoneRegex.test(row.PhoneNumber)) {
        this.invalidPhone = `Invalid phone number format.`;
      }


      if (missingFields.length > 0) {
        this.showEror = true;

        // Show which specific fields are missing
        this.parsedData[i].error = `${missingFields.join(
          ', '
        )} field are missing.`;
        this.errors.push(
          `Row ${
            i + 1
          } is missing the following essential fields: ${missingFields.join(
            ', '
          )}.`
        );
      }
      if(this.invalidEmail )
      {
        this.parsedData[i].error = `${this.parsedData[i].error || ''} ${this.invalidEmail}`
      }
      if(this.invalidPhone){
        this.parsedData[i].error = `${this.parsedData[i].error || ''} ${this.invalidPhone}`
      }

      if(!this.parsedData[i].error){
        this.validData.push(this.parsedData[i])
      }

    }
  }

  uploadData(): void {

      const jsonString = JSON.stringify(this.validData);
      localStorage.setItem('contactsKey', jsonString);
      alert('Contacts uploaded successfully!');
      this.route.navigateByUrl('contacts');

  }
}
