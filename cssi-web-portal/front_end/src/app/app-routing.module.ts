import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AboutComponent } from './about/about.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { ForgottenPasswordComponent } from './forgotten-password/forgotten-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ToolBarComponent } from './tool-bar/tool-bar.component';
import { UserHomeComponent } from './user-home/user-home.component';
import { LoginComponent, authGuard } from './login/login.component';
import { OrganizationPageComponent } from './organization-page/organization-page.component';
import { DevicePageComponent } from './device-page/device-page.component';
import { FilterPageComponent } from './filter-page/filter-page.component';
import { AddOrganizationComponent } from './add-organization/add-organization.component';
import { ApplicationPageComponent } from './application-page/application-page.component';
import { AddApplicationComponent } from './add-application/add-application.component';
import { AddDeviceComponent } from './add-device/add-device.component';
import { InviteUserComponent } from './invite-user/invite-user.component';

// Huy and Colin created the paths and linked the respective components to in order to properly route with Angular's routing
// Huy created the dynamic routing pathways

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  { path: 'about', component: AboutComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgotten-password', component: ForgottenPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'tool-bar', component: ToolBarComponent },
  { path: 'home', component: UserHomeComponent },
  { path: 'home/:user', component: UserHomeComponent }, //:user is dynamic
  { path: 'add-organization/:user', component: AddOrganizationComponent }, //:user is dynamic
  {
    path: 'add-application/:orgId',
    component: AddApplicationComponent,
  },
  { path: 'add-device/:appId/:orgId', component: AddDeviceComponent }, //:user is dynamic
  { path: 'invite-user/:org', component: InviteUserComponent },
  { path: 'organization', component: OrganizationPageComponent },
  { path: 'organization/:org', component: OrganizationPageComponent }, //:org is dynamic
  // { path: 'organization/:org/:user', component: OrganizationPageComponent }, //:org is dynamic
  { path: 'application', component: ApplicationPageComponent },
  { path: 'application/:app', component: ApplicationPageComponent },
  {
    path: 'application/:app/:org',
    component: ApplicationPageComponent,
  },
  { path: 'device', component: DevicePageComponent },
  { path: 'device/:app/:dev', component: DevicePageComponent },
  // { path: 'device/:curDevice', component: DevicePageComponent }, //:curDevice is dynamic
  { path: 'filter/:app', component: FilterPageComponent },
  { path: '**', pathMatch: 'full', component: HomeComponent }, //Star route put at the end for if no path is found, routes back to landing.
];

//NgModule was generated when creating the application's routing file by angular.

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
