import { MasterService } from './../../services/master.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-details',
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css',
})
export class DetailsComponent implements OnInit {
  contactId: number = 0;
  contact: any = {};
  isEditing: boolean = false;
  isOtherUserEditing: boolean = false; // Flag to check if another user is editing
  localstoredArray: number[] = [];
  showError: boolean = false;
  errorMessage: string = '';
  constructor(
    private route: ActivatedRoute,
    private contactService: MasterService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get contact ID from URL parameter
    this.contactId = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch contact details
    this.fetchContactDetails();

    this.localstoredArray = JSON.parse(
      localStorage.getItem('numberArray') || '[]'
    );
    if (this.localstoredArray.includes(this.contactId)) {
      this.isOtherUserEditing = true;
    }
  }

  fetchContactDetails(): void {
    this.contactService.getContactById(this.contactId).subscribe((contact) => {
      this.contact = contact;
    });
  }

  startEditing() {
    this.localstoredArray = JSON.parse(
      localStorage.getItem('numberArray') || '[]'
    );
    if (!this.localstoredArray.includes(this.contactId)) {
      // Add the number to the array if it isn't present
      this.isOtherUserEditing = false;
      this.localstoredArray.push(this.contactId);

      // Store the updated array back to localStorage
      localStorage.setItem(
        'numberArray',
        JSON.stringify(this.localstoredArray)
      );
      console.log('Number added:', this.contactId);
      this.contactService.setEditingState(this.contact.Id, true);
      this.isEditing = true;
    } else {
      this.isOtherUserEditing = true;
      this.showError = true;
      this.errorMessage =
        'This contact is under editing by another user. Kindly try again later..';
      return; // Prevent editing if another user is editing
    }
  }

  // Save the updated contact
  saveContact(): void {
    this.contactService
      .updateContact(this.contactId, this.contact)
      .subscribe((updatedContact) => {
        if (updatedContact) {
          this.contact = updatedContact;
          this.isEditing = false;
          const index = this.localstoredArray.indexOf(this.contactId);
          this.localstoredArray.splice(index, 1);
          localStorage.setItem(
            'numberArray',
            JSON.stringify(this.localstoredArray)
          );
        } else {
          alert('Error updating contact.');
        }
      });
  }

  // Cancel editing and revert the contact details
  cancelEditing(): void {
    this.isEditing = false;
    this.isEditing = false; // Stop editing
    const index = this.localstoredArray.indexOf(this.contactId);
    this.localstoredArray.splice(index, 1);
    localStorage.setItem('numberArray', JSON.stringify(this.localstoredArray));
    this.fetchContactDetails(); // Re-fetch contact details to reset any changes
  }

  // Delete the contact
  deleteContact(): void {
    this.localstoredArray = JSON.parse(
      localStorage.getItem('numberArray') || '[]'
    );
    if (!this.localstoredArray.includes(this.contactId)) {
      if (confirm('Are you sure you want to delete this contact?')) {
        this.contactService
          .deleteContact(this.contactId)
          .subscribe((isDeleted) => {
            if (isDeleted) {
              alert('Contact deleted successfully');
              this.router.navigate(['/contacts']); // Navigate to the contacts list
            } else {
              // alert('Error deleting contact.');
              this.showError = true;
              this.errorMessage = 'Error deleting contact.';
            }
          });
      }
    } else {
      this.isOtherUserEditing = true;
      this.showError = true;
      this.errorMessage =
        'This contact is under editing by another user. Kindly try again later..';
      return; // Prevent editing if another user is editing
    }
  }
}
