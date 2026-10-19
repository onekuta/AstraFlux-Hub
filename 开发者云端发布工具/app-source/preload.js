const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('publisherAPI', {
  platform: process.platform,
  minimize: () => ipcRenderer.send('window-minimize'),
  close: () => ipcRenderer.send('window-close'),
  openSecondaryWindow: (viewType) => ipcRenderer.send('open-secondary-window', viewType),
  
  selectPackageFile: () => ipcRenderer.invoke('select-package-file'),
  parseDroppedPackageBuffer: (fileName, arrayBuf) => ipcRenderer.invoke('parse-dropped-package-buffer', fileName, arrayBuf),
  selectInstallerFile: () => ipcRenderer.invoke('select-installer-file'),
  testUrlReachability: (url) => ipcRenderer.invoke('test-url-reachability', url),

  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (cfg) => ipcRenderer.invoke('save-config', cfg),
  testCloudConnection: (cfg) => ipcRenderer.invoke('test-cloud-connection', cfg),
  loadDefaultDatabase: () => ipcRenderer.invoke('load-default-database'),

  publishLibUpdate: (payload) => ipcRenderer.invoke('publish-lib-update', payload),
  publishAppUpdate: (payload) => ipcRenderer.invoke('publish-app-update', payload),
  publishToCloud: (payload) => ipcRenderer.invoke('publish-to-cloud', payload),
  exportLocalPackage: (payload) => ipcRenderer.invoke('export-local-package', payload),
  exportSpkdbBundle: (payload) => ipcRenderer.invoke('export-spkdb-bundle', payload),
  exportGreenPatch: (payload) => ipcRenderer.invoke('export-green-patch', payload),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),

  onPublishLog: (callback) => {
    const handler = (event, logItem) => callback(logItem);
    ipcRenderer.on('publish-log', handler);
    return () => ipcRenderer.removeListener('publish-log', handler);
  },
  onSwitchView: (callback) => {
    const handler = (event, viewType) => callback(viewType);
    ipcRenderer.on('switch-view', handler);
    return () => ipcRenderer.removeListener('switch-view', handler);
  },
});
