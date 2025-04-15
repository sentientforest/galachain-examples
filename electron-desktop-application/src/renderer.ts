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
        <input type="text" id="apiUrl" placeholder="API URL">
        <input type="password" id="adminKey" placeholder="Admin Private Key">
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
    input {
      display: block;
      margin: 10px 0;
      padding: 8px;
      width: 100%;
      max-width: 300px;
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
  const adminKeyInput = document.getElementById('adminKey') as HTMLInputElement;

  // Helper to update the UI
  const updateKeyInfo = (keys: { publicKey: string; privateKey: string } | null) => {
    if (!keyInfo) return;
    if (keys) {
      keyInfo.innerHTML = `
        <p><strong>Public Key:</strong> ${keys.publicKey.slice(0, 20)}...</p>
        <p><strong>Private Key:</strong> ${keys.privateKey.slice(0, 20)}...</p>
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
    const adminKey = adminKeyInput?.value;

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

  // Initial load
  window.keyManager.loadKeys().then(updateKeyInfo);
});

