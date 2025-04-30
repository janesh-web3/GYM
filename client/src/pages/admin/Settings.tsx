import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Shield,
  Bell,
  Mail,
  CreditCard,
  Globe,
  Users,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface SettingSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const settingSections: SettingSection[] = [
  {
    id: 'general',
    title: 'General Settings',
    description: 'Configure basic platform settings and preferences',
    icon: <SettingsIcon className="w-5 h-5" />
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Manage security settings and access controls',
    icon: <Shield className="w-5 h-5" />
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure notification preferences and templates',
    icon: <Bell className="w-5 h-5" />
  },
  {
    id: 'email',
    title: 'Email Settings',
    description: 'Manage email templates and delivery settings',
    icon: <Mail className="w-5 h-5" />
  },
  {
    id: 'payment',
    title: 'Payment Settings',
    description: 'Configure payment gateways and billing settings',
    icon: <CreditCard className="w-5 h-5" />
  },
  {
    id: 'regional',
    title: 'Regional Settings',
    description: 'Set up language and regional preferences',
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Configure user roles and permissions',
    icon: <Users className="w-5 h-5" />
  },
  {
    id: 'terms',
    title: 'Terms & Policies',
    description: 'Manage terms of service and privacy policies',
    icon: <FileText className="w-5 h-5" />
  }
];

const Settings = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure platform settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{section.title}</div>
                  <div className="text-xs text-gray-500">{section.description}</div>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow border border-gray-200">
            <div className="p-6">
              {/* General Settings */}
              {activeSection === 'general' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">General Settings</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure basic platform settings
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Gym Management System"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Platform Logo
                      </label>
                      <div className="mt-1 flex items-center">
                        <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
                          <SettingsIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <button className="ml-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                          Change Logo
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Default Timezone
                      </label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option>UTC</option>
                        <option>EST</option>
                        <option>PST</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeSection === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure security and access control settings
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Session Timeout
                      </label>
                      <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>2 hours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Two-Factor Authentication
                      </label>
                      <div className="mt-2">
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">Enable 2FA for all users</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Password Policy
                      </label>
                      <div className="mt-2 space-y-2">
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">Require minimum 8 characters</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">Require numbers</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">Require special characters</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Configure notification preferences
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <div className="mt-2 space-y-2">
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">New member registrations</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">Payment notifications</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">System alerts</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Push Notifications
                      </label>
                      <div className="mt-2 space-y-2">
                        <label className="inline-flex items-center">
                          <input type="checkbox" className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          <span className="ml-2 text-sm text-gray-700">Enable push notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 