import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('keyManager', {
  generateKeys: () => ipcRenderer.invoke('generateKeys'),
  loadKeys: () => ipcRenderer.invoke('loadKeys'),
  deleteKeys: () => ipcRenderer.invoke('deleteKeys'),
  listAdminKeys: () => ipcRenderer.invoke('listAdminKeys'),
  registerUser: (apiUrl: string, adminPrivateKey: string) => 
    ipcRenderer.invoke('registerUser', apiUrl, adminPrivateKey)
});

// Add type definitions for the exposed API
interface AdminKeyInfo {
  project: string;
  name: string;
  publicKey?: string;
  privateKey: string;
}

declare global {
  interface Window {
    keyManager: {
      generateKeys: () => Promise<{ publicKey: string; privateKey: string }>;
      loadKeys: () => Promise<{ publicKey: string; privateKey: string } | null>;
      deleteKeys: () => Promise<void>;
      listAdminKeys: () => Promise<AdminKeyInfo[]>;
      registerUser: (apiUrl: string, adminPrivateKey: string) => Promise<any>;
    };
  }
}
