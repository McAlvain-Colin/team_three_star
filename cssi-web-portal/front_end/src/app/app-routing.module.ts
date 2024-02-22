import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AboutComponent } from './about/about.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgottenPasswordComponent } from './forgotten-password/forgotten-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { LoginComponent } from './login/login.component';
import { UserHomeComponent } from './user-home/user-home.component';
import { OrganizationPageComponent } from './organization-page/organization-page.component';
import { DevicePageComponent } from './device-page/device-page.component';
import { FilterPageComponent } from './filter-page/filter-page.component';

// Huy and Colin created the paths and linked the respective components to in order to properly route with Angular's routing

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'about', component: AboutComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotten-password', component: ForgottenPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'tool-bar', component: ToolBarComponent },
  { path: 'home', component: UserHomeComponent },
  { path: 'organization', component: OrganizationPageComponent },
  { path: 'device', component: DevicePageComponent },
  { path: 'filter', component: FilterPageComponent },
];

//NgModule was generated when creating the application's routing file by angular.

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
