export default function SettingsPage() {
  return (
    <div className="row g-4">
      <div className="col-12 col-xl-6">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">Company Settings</h5>
            <div className="mb-3">
              <label className="form-label">Company Name</label>
              <input className="form-control" defaultValue="Lumensoft POS" />
            </div>
            <div className="mb-3">
              <label className="form-label">Currency</label>
              <input className="form-control" defaultValue="PKR" />
            </div>
            <div className="mb-3">
              <label className="form-label">Tax Rate (%)</label>
              <input className="form-control" defaultValue="0" />
            </div>
            <button className="btn btn-primary">Save Settings</button>
          </div>
        </div>
      </div>
      <div className="col-12 col-xl-6">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">System Preferences</h5>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" defaultChecked />
              <label className="form-check-label">Enable notifications</label>
            </div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" defaultChecked />
              <label className="form-check-label">Show recent sales chart</label>
            </div>
            <div className="form-check form-switch mb-3">
              <input className="form-check-input" type="checkbox" />
              <label className="form-check-label">Enable print preview</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
