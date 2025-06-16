import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { StartupComponent } from './components/startup/startup.component';
import { ChatComponent } from './components/chat/chat.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'startup',
    component: StartupComponent
  },
  {
    path: 'chat',
    component: ChatComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/chat',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'startup'
  }
];
