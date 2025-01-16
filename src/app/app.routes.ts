import { Routes } from '@angular/router';
import { ContanctsComponent } from './pages/contancts/contancts.component';
import { UploadComponent } from './pages/upload/upload.component';
import { DetailsComponent } from './pages/details/details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/upload', pathMatch: 'full' },
  { path: 'contacts', component: ContanctsComponent },
  { path: 'upload', component: UploadComponent },
  { path: 'contact/edit/:id', component: DetailsComponent },
];
