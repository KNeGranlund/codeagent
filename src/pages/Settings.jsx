import './Page.css';

function Settings() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your CodeAgent experience and preferences.</p>
      </div>
      
      <div className="page-content">
        <div className="settings-container">
          
          {/* Profile Settings */}
          <div className="settings-section">
            <h2>Profile</h2>
            <div className="settings-group">
              <div className="setting-item">
                <label htmlFor="username">Username</label>
                <input type="text" id="username" defaultValue="developer" />
              </div>
              <div className="setting-item">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" defaultValue="developer@codeagent.com" />
              </div>
              <div className="setting-item">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" rows="3" defaultValue="Full-stack developer passionate about AI and automation."></textarea>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="settings-section">
            <h2>Appearance</h2>
            <div className="settings-group">
              <div className="setting-item">
                <label htmlFor="theme">Theme</label>
                <select id="theme" defaultValue="auto">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div className="setting-item">
                <label htmlFor="language">Language</label>
                <select id="language" defaultValue="en">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="compact-mode" defaultChecked />
                <label htmlFor="compact-mode">Compact mode</label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-section">
            <h2>Notifications</h2>
            <div className="settings-group">
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="email-notifications" defaultChecked />
                <label htmlFor="email-notifications">Email notifications</label>
              </div>
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="push-notifications" defaultChecked />
                <label htmlFor="push-notifications">Push notifications</label>
              </div>
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="agent-alerts" defaultChecked />
                <label htmlFor="agent-alerts">Agent completion alerts</label>
              </div>
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="project-updates" />
                <label htmlFor="project-updates">Project update summaries</label>
              </div>
            </div>
          </div>

          {/* Developer Settings */}
          <div className="settings-section">
            <h2>Developer</h2>
            <div className="settings-group">
              <div className="setting-item">
                <label htmlFor="editor">Default Editor</label>
                <select id="editor" defaultValue="vscode">
                  <option value="vscode">Visual Studio Code</option>
                  <option value="vim">Vim</option>
                  <option value="emacs">Emacs</option>
                  <option value="sublime">Sublime Text</option>
                </select>
              </div>
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="auto-save" defaultChecked />
                <label htmlFor="auto-save">Auto-save files</label>
              </div>
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="debug-mode" />
                <label htmlFor="debug-mode">Enable debug mode</label>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="settings-section">
            <h2>Security</h2>
            <div className="settings-group">
              <div className="setting-item">
                <button className="secondary-button">Change Password</button>
              </div>
              <div className="setting-item">
                <button className="secondary-button">Manage API Keys</button>
              </div>
              <div className="setting-item checkbox-item">
                <input type="checkbox" id="two-factor" />
                <label htmlFor="two-factor">Enable two-factor authentication</label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="settings-actions">
            <button className="primary-button">Save Changes</button>
            <button className="secondary-button">Reset to Defaults</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;