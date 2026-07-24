import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import SectionCard from '../components/SectionCard.jsx';
import SettingSwitch from '../components/SettingSwitch.jsx';

const defaultSettings = {
  companyName: 'Lumensoft POS',
  currency: 'PKR',
  taxRate: 0,
  notificationsEnabled: true,
  showRecentSalesChart: true,
  printEnabled: true,
  discountEnabled: true,
  darkMode: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    const stored = window.localStorage.getItem('lumensoft-settings');
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const handleSave = () => {
    window.localStorage.setItem('lumensoft-settings', JSON.stringify(settings));
    window.dispatchEvent(new Event('lumensoft:settings'));
    Swal.fire('Saved', 'Settings updated successfully.', 'success');
  };

  return (
    <div className="row g-4">
      <div className="col-12 col-xl-6">
        <SectionCard title="Company Settings" footer={<button className="btn btn-primary" onClick={handleSave}>Save Settings</button>}>
          <div className="mb-3">
            <label className="form-label">Company Name</label>
            <input className="form-control" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Currency</label>
            <input className="form-control" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Tax Rate (%)</label>
            <input type="number" className="form-control" value={settings.taxRate} onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })} />
          </div>
        </SectionCard>
      </div>
      <div className="col-12 col-xl-6">
        <SectionCard title="System Preferences">
          <SettingSwitch label="Enable notifications" checked={settings.notificationsEnabled} onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })} />
          <SettingSwitch label="Show recent sales chart" checked={settings.showRecentSalesChart} onChange={(e) => setSettings({ ...settings, showRecentSalesChart: e.target.checked })} />
          <SettingSwitch label="Enable receipt printing" checked={settings.printEnabled} onChange={(e) => setSettings({ ...settings, printEnabled: e.target.checked })} />
          <SettingSwitch label="Enable item discounts" description="Turn this on to allow discounts in the POS screen." checked={settings.discountEnabled} onChange={(e) => setSettings({ ...settings, discountEnabled: e.target.checked })} />
          <SettingSwitch label="Enable dark mode" description="Switch the app between light and dark themes." checked={settings.darkMode} onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })} />
        </SectionCard>
      </div>
    </div>
  );
}
