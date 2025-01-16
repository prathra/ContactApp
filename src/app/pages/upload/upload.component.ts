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

  constructor(private masterService: MasterService, private route: Router) {}

  onFileSelected(event: any): void {
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
      // Proceed to read the file if it's a valid Excel file
      console.log('Selected file:', file.name);
      this.readFile(file);
    } else {
      // Push error if the file is not a valid Excel file
      this.errors.push('Please upload a valid Excel file (.xlsx or .xls).');
      console.log('Invalid file type:', file.name);
    }
  }

  readFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const sheet = workbook.Sheets[sheetName];
      this.parsedData = XLSX.utils.sheet_to_json(sheet);
      console.log('', this.parsedData);

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
      if (!row.Name || !row.Email || !row.PhoneNumber) {
        this.errors.push(
          `Row ${
            i + 1
          } is missing essential fields: Name, Email, or Phone Number.`
        );
      } else {
        if (!emailRegex.test(row.Email)) {
          this.errors.push(`Row ${i + 1} has an invalid email format.`);
        }
        if (!phoneRegex.test(row.PhoneNumber)) {
          this.errors.push(`Row ${i + 1} has an invalid phone number format.`);
        }
      }
    }
  }

  uploadData(): void {
    if (this.errors.length === 0 && this.parsedData.length > 0) {
      const jsonString = JSON.stringify(this.parsedData);
      localStorage.setItem('contactsKey', jsonString);
      alert('Contacts uploaded successfully!');
      this.route.navigateByUrl('contacts');
    } else {
      alert('There are errors in the data. Please fix them before uploading.');
    }
  }
}
