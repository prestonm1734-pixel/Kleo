import { Switch, Route, Router as WouterRouter } from 'wouter';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SettingsPage from './pages/SettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/integrations" component={IntegrationsPage} />
      <Route>
        <div className="flex items-center justify-center h-full" style={{ background: '#F2F1EE' }}>
          <p style={{ color: '#888888' }}>Page not found</p>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Router />
    </WouterRouter>
  );
}
