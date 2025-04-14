import { contextBridge } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Add your API methods here
  // Example:
  // send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  // receive: (channel: string, func: Function) => ipcRenderer.on(channel, func),
});
