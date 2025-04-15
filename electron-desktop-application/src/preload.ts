import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('keyManager', {
  generateKeys: () => ipcRenderer.invoke('generateKeys'),
  loadKeys: () => ipcRenderer.invoke('loadKeys'),
  deleteKeys: () => ipcRenderer.invoke('deleteKeys'),
  registerUser: (apiUrl: string, adminPrivateKey: string) => 
    ipcRenderer.invoke('registerUser', apiUrl, adminPrivateKey)
});

// Add type definitions for the exposed API
declare global {
  interface Window {
    keyManager: {
      generateKeys: () => Promise<{ publicKey: string; privateKey: string }>;
      loadKeys: () => Promise<{ publicKey: string; privateKey: string } | null>;
      deleteKeys: () => Promise<void>;
      registerUser: (apiUrl: string, adminPrivateKey: string) => Promise<any>;
    };
  }
}
