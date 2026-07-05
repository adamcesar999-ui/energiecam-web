import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Calculator } from './pages/calculator/calculator';
import { WindCalculator } from './pages/wind-calculator/wind-calculator';
import { Projects } from './pages/projects/projects';
import { AdvancedTools } from './pages/advanced-tools/advanced-tools';
import { Messages } from './pages/messages/messages';
import { Admin } from './pages/admin/admin';
import { Help } from './pages/help/help';
import { AiAssistant } from './pages/ai-assistant/ai-assistant';
import { Comparison } from './pages/comparison/comparison';
import { PriceComparatorComponent } from './components/price-comparator/price-comparator';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
  { path: 'ai-assistant', component: AiAssistant },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'calculator', component: Calculator },
  { path: 'wind-calculator', component: WindCalculator },
  { path: 'projects', component: Projects },
  { path: 'advanced-tools', component: AdvancedTools },
  { path: 'messages', component: Messages },
  { path: 'admin', component: Admin },
  { path: 'help', component: Help },
  { path: 'comparison', component: Comparison },
  { path: 'price-comparator', component: PriceComparatorComponent },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'profile', component: Profile },
];
