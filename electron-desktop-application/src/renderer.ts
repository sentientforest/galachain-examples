document.addEventListener('DOMContentLoaded', () => {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="container">
      <h2>Gala Chain Key Management</h2>
      <div class="key-info" id="keyInfo">
        <p>No keys loaded</p>
      </div>
      <div class="actions">
        <button id="generateBtn">Generate New Keys</button>
        <button id="loadBtn">Load Existing Keys</button>
        <button id="deleteBtn">Delete Keys</button>
      </div>
      <div class="registration">
        <h3>User Registration</h3>
        <div class="admin-keys" id="adminKeys">
          <h4>Available Admin Keys</h4>
          <p>Loading admin keys...</p>
        </div>
        <input type="text" id="apiUrl" placeholder="API URL">
        <select id="adminKey">
          <option value="">Select an admin key...</option>
        </select>
        <button id="registerBtn">Register User</button>
      </div>
      <pre id="output"></pre>
    </div>
  `;

  // Add some basic styles
  const style = document.createElement('style');
  style.textContent = `
    .container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    .key-info {
      background: #f5f5f5;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .actions {
      margin: 20px 0;
    }
    button {
      margin: 5px;
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #45a049;
    }
    input, select {
      display: block;
      margin: 10px 0;
      padding: 8px;
      width: 100%;
      max-width: 300px;
    }
    .admin-keys {
      background: #f5f5f5;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .admin-keys ul {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }
    .admin-keys li {
      margin: 10px 0;
      padding: 10px;
      background: white;
      border-radius: 4px;
    }
    .error {
      color: #d32f2f;
    }
    pre {
      background: #f8f8f8;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }
  `;
  document.head.appendChild(style);

  // Get DOM elements
  const keyInfo = document.getElementById('keyInfo');
  const output = document.getElementById('output');
  const generateBtn = document.getElementById('generateBtn');
  const loadBtn = document.getElementById('loadBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const registerBtn = document.getElementById('registerBtn');
  const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
  const adminKeySelect = document.getElementById('adminKey') as HTMLSelectElement;
  const adminKeysDiv = document.getElementById('adminKeys');

  // Helper to update the UI
  const updateKeyInfo = (keys: { name?: string; publicKey?: string; privateKey: string } | null) => {
    if (!keyInfo) return;
    if (keys) {
      keyInfo.innerHTML = `
        <p><strong>Selected Key:</strong> ${keys.name ?? keys.publicKey}</p>
      `;
    } else {
      keyInfo.innerHTML = '<p>No keys loaded</p>';
    }
  };

  // Helper to show output
  const showOutput = (message: string) => {
    if (!output) return;
    output.textContent = typeof message === 'string' ? message : JSON.stringify(message, null, 2);
  };

  // Event handlers
  generateBtn?.addEventListener('click', async () => {
    try {
      const keys = await window.keyManager.generateKeys();
      updateKeyInfo(keys);
      showOutput('Keys generated successfully!');
    } catch (error) {
      showOutput(`Error generating keys: ${error}`);
    }
  });

  loadBtn?.addEventListener('click', async () => {
    try {
      const keys = await window.keyManager.loadKeys();
      updateKeyInfo(keys);
      showOutput(keys ? 'Keys loaded successfully!' : 'No keys found.');
    } catch (error) {
      showOutput(`Error loading keys: ${error}`);
    }
  });

  deleteBtn?.addEventListener('click', async () => {
    try {
      await window.keyManager.deleteKeys();
      updateKeyInfo(null);
      showOutput('Keys deleted successfully!');
    } catch (error) {
      showOutput(`Error deleting keys: ${error}`);
    }
  });

  registerBtn?.addEventListener('click', async () => {
    const apiUrl = apiUrlInput?.value;
    const adminKey = adminKeySelect?.value;

    if (!apiUrl || !adminKey) {
      showOutput('Please provide both API URL and admin private key.');
      return;
    }

    try {
      const result = await window.keyManager.registerUser(apiUrl, adminKey);
      showOutput(result);
    } catch (error) {
      showOutput(`Error registering user: ${error}`);
    }
  });

  // Load admin keys
  const loadAdminKeys = async () => {
    try {
      const adminKeys = await window.keyManager.listAdminKeys();
      if (!adminKeysDiv || !adminKeySelect) return;

      if (adminKeys.length === 0) {
        adminKeysDiv.innerHTML = `
          <h4>Available Admin Keys</h4>
          <p>No admin keys found in ~/gc-keys directory.</p>
          <p>Please create admin keys for your local chaincode development first.</p>
        `;
        return;
      }

      adminKeysDiv.innerHTML = `
        <h4>Available Admin Keys</h4>
        <p>Found ${adminKeys.length} key(s):</p>
        <ul>
          ${adminKeys.map(key => `
            <li>
              <strong>${key.project}</strong><br>
              <small>Key: ${key.name}</small>
            </li>
          `).join('')}
        </ul>
      `;

      // Update select options
      adminKeySelect.innerHTML = `
        <option value="">Select an admin key...</option>
        ${adminKeys.map(key => `
          <option value="${key.privateKey}">${key.name} - ${key.project}</option>
        `).join('')}
      `;
    } catch (error) {
      if (!adminKeysDiv) return;
      adminKeysDiv.innerHTML = `
        <h4>Available Admin Keys</h4>
        <p class="error">Error loading admin keys: ${error}</p>
      `;
    }
  };

  // Initial loads
  window.keyManager.loadKeys().then(updateKeyInfo);
  loadAdminKeys();
});

