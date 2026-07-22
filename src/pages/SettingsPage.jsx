import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const defaultSettings = {
  companyName: 'Lumensoft POS',
  currency: 'PKR',
  taxRate: 0,
  notificationsEnabled: true,
  showRecentSalesChart: true,
  printEnabled: true,
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
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">Company Settings</h5>
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
            <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
          </div>
        </div>
      </div>
      <div className="col-12 col-xl-6">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">System Preferences</h5>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" checked={settings.notificationsEnabled} onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })} />
              <label className="form-check-label">Enable notifications</label>
            </div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" checked={settings.showRecentSalesChart} onChange={(e) => setSettings({ ...settings, showRecentSalesChart: e.target.checked })} />
              <label className="form-check-label">Show recent sales chart</label>
            </div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" checked={settings.printEnabled} onChange={(e) => setSettings({ ...settings, printEnabled: e.target.checked })} />
              <label className="form-check-label">Enable receipt printing</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
