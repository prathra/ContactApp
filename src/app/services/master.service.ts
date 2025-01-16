import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class MasterService {
  // contactsDetails:BehaviorSubject<any> = new BehaviorSubject<any>("");
  key: any = 'contactsKey';
  number: any = 0;
  // Mock contact data (this can be replaced with API calls in a real app)
  private editingState: { [contactId: number]: string[] } = {};
  contacts: any;
  isContactId: number = 0;
  contactsNew: any[] = [];

  constructor(private http: HttpClient) {}

  getContacts(): Observable<any[]> {
    // This is mocked data for now, assuming the API returns an array of contacts
    const jsonStrings = localStorage.getItem('contactsKey');
    if (jsonStrings) {
      this.contacts = JSON.parse(jsonStrings);
    }

    // Return the contacts as an Observable
    return of(this.contacts);
  }

  // Fetch a specific contact by ID
  getContactById(contactId: number): Observable<any> {
    // Simulate API call with the mock data
    this.getContacts();
    const contact = this.contacts.find((c: any) => c.Id === contactId);
    return of(contact); // Return as observable
  }

  // Simulate updating the contact
  updateContact(contactId: number, updatedContact: any): Observable<any> {
    // Update the contact in the array
    const index = this.contacts.findIndex((c: any) => c.Id === contactId);
    if (index !== -1) {
      this.contacts[index] = { ...this.contacts[index], ...updatedContact };

      localStorage.setItem('contactsKey', JSON.stringify(this.contacts));

      return of(this.contacts[index]); // Return updated contact as observable
    }
    return of(null); // Return null if contact not found
  }

  // Simulate deleting the contact
  deleteContact(contactId: number): Observable<boolean> {
    const index = this.contacts.findIndex((c: any) => c.Id === contactId);
    if (index !== -1) {
      this.contacts.splice(index, 1); // Remove the contact from array
      localStorage.setItem('contactsKey', JSON.stringify(this.contacts));
      return of(true); // Return true indicating successful deletion
    }
    return of(false); // Return false if contact not found
  }

  // Set the contact editing state in localStorage
  setEditingState(contactId: number, isEditing: boolean): void {
    debugger;
    localStorage.setItem(`contact-${contactId}-editing`, isEditing.toString());
    // Retrieve the current array of numbers from localStorage, or initialize an empty array if none exists
    let storedArray: number[] = JSON.parse(
      localStorage.getItem('numberArray') || '[]'
    );

    // Check if the number is already in the array
    if (!storedArray.includes(contactId)) {
      // Add the number to the array if it isn't present
      storedArray.push(contactId);

      // Store the updated array back to localStorage
      localStorage.setItem('numberArray', JSON.stringify(storedArray));
      console.log('Number added:', contactId);
    } else {
      console.log('Number is already in the array:', contactId);
    }
  }
}
