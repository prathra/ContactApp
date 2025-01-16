import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { filter, Observable, of } from 'rxjs';
import { MasterService } from '../../services/master.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-contancts',
  imports: [FormsModule,  CommonModule],
  templateUrl: './contancts.component.html',
  styleUrl: './contancts.component.css',
})
export class ContanctsComponent implements OnInit {
  contacts: any = []; // List of all contacts
  paginatedData: any = []; // Data for the current page
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 0;
  pages: any = [];
  isModalVisible: boolean = false;
  selectedContacts: any = [];
  currentSortColumn: string = '';
  showError: boolean = false;
  errorMessage: string = '';
  currentSortDirection: boolean = true;

  constructor(private contactService: MasterService, private route: Router) {}

  ngOnInit() {
    this.contactService.getContacts().subscribe((res: any) => {
      this.contacts = res;
    });
    this.calculateTotalPages();
    this.applyPagination();
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.contacts.slice(startIndex, endIndex);
    this.updatePaginationControls();
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.contacts.length / this.pageSize);
  }

  updatePaginationControls() {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();
    }
  }
  sortData(column: string): void {
    debugger;
    console.log('Sorting by:', column);

    // Check if we're already sorting by this column
    if (this.currentSortColumn === column) {
      // Toggle the sort direction if clicking the same column
      this.currentSortDirection = !this.currentSortDirection;
    } else {
      // Default to ascending if a new column is clicked
      this.currentSortColumn = column;
      this.currentSortDirection = true;
    }

    // Perform the sorting
    this.paginatedData.sort((a: any, b: any) => {
      const valueA = a[column];
      const valueB = b[column];

      // If values are not comparable (e.g., undefined), treat them as 0
      const compare = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      return this.currentSortDirection ? compare : -compare;
    });
  }

  applyFilter() {
    if (this.searchText) {
      this.contacts = this.contacts.filter(
        (contact: any) =>
          contact.Name.toLowerCase().includes(this.searchText.toLowerCase()) ||
          contact.Email.toLowerCase().includes(this.searchText.toLowerCase()) ||
          contact.PhoneNumber.toString().includes(this.searchText)
      );
    } else {
      const jsonStrings = localStorage.getItem('contactsKey');
      if (jsonStrings) {
        this.contacts = JSON.parse(jsonStrings);
      }
    }
    this.calculateTotalPages();
    this.applyPagination();
  }

  selectAll(event: any) {
    const isChecked = event.target.checked;
    this.contacts.forEach((contact: any) => (contact.selected = isChecked));
  }

  batchDelete() {
    // Filter the contacts to get selected contacts
    const selectedContacts = this.contacts.filter(
      (contact: any) => contact.selected
    );

    // Check if any contacts are selected
    if (selectedContacts.length === 0) {
      // Show error if no contacts are selected
      alert('Please select at least one contact to delete.');
      return; // Exit the function if no contacts are selected
    }

    // Proceed with deletion if contacts are selected
    this.contacts = this.contacts.filter((contact: any) => !contact.selected);

    // Save the updated contacts list to localStorage
    localStorage.setItem('contactsKey', JSON.stringify(this.contacts));

    // Recalculate pagination
    this.calculateTotalPages();
    this.applyPagination();
  }

  exportSelected() {
    // Filter selected contacts
    const selectedContacts = this.contacts.filter(
      (contact: any) => contact.selected
    );

    // If no contacts are selected, show an alert
    if (selectedContacts.length === 0) {
      alert('No contacts selected to export.');
      return;
    }

    // Define the CSV header row (fields)
    const header = [
      'Name',
      'Email',
      'PhoneNumber',
      'Address',
      'DateofBirth',
      'Gender',
      'Occupation',
      'Id',
    ];

    // Prepare the data in a format that SheetJS can use
    const data = selectedContacts.map((contact: any) => [
      contact.Name,
      contact.Email,
      contact.PhoneNumber,
      contact.Address,
      contact.DateofBirth,
      contact.Gender,
      contact.Occupation,
      contact.Id,
    ]);

    // Combine header and data into one array
    const worksheetData = [header, ...data];

    // Create a worksheet from the data
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Create a new workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Contacts');

    // Write the workbook as a binary .xls or .xlsx file
    const fileExtension = '.xlsx'; // You can change to '.xls' if needed
    const blob = XLSX.write(wb, {
      bookType: fileExtension === '.xlsx' ? 'xlsx' : 'xls', // Specify the format here
      type: 'array', // Get the file as a binary array
    });

    // Create a download link and trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([blob], { type: 'application/vnd.ms-excel' })
    );
    link.download = `contacts${fileExtension}`; // File will be named contacts.xlsx or contacts.xls
    link.click();
  }

  viewContact(contact: any) {
    alert(`View Contact: ${contact.Name}`);
  }

  editContact(contact: any) {
    alert(`Edit Contact: ${contact.Name}`);
  }

  deleteContact(contact: any) {
     if (confirm('Are you sure you want to delete this contact?')) {
      this.contactService.deleteContact(contact.Id).subscribe((isDeleted) => {
        if (isDeleted) {
          alert('Contact deleted successfully');
          this.calculateTotalPages();
          this.applyPagination();
        } else {
           this.showError = true;
           this.errorMessage = 'Error deleting contact.';
        }
      });
    }
  }


  closeModal() {
    this.isModalVisible = false; // Close modal
  }

  updateContact() {
    // Find and update the contact

    const index = this.contacts.findIndex(
      (c: any) => c.Id === this.selectedContacts.Id
    );
    if (index !== -1) {
      this.contacts[index] = { ...this.selectedContacts };
      this.applyPagination(); // Reapply pagination after the update
    }

    // Close the modal after update
    this.closeModal();
  }

  openEditModal(contact: any) {
    this.route.navigate([`/contact/edit/${contact.Id}`]);
    // this.closeModal();
  }

  // Check if any contact is selected
  anySelected(): boolean {
    return this.paginatedData.some((contact: any) => contact.selected);
  }
}
