const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  checkUsb3Driver: () => ipcRenderer.invoke('check-usb3-driver'),
  installUsb3Driver: (customPath) => ipcRenderer.invoke('install-usb3-driver', customPath),
  selectDriverFile: () => ipcRenderer.invoke('select-driver-file'),
  openExternalUrl: (url) => ipcRenderer.invoke('open-external-url', url),
  // 系统设置与单实例托盘联动
  saveAppSettings: (settings) => ipcRenderer.invoke('sync-app-settings', settings),
  syncAppSettings: (settings) => ipcRenderer.invoke('sync-app-settings', settings),
  getAppSettings: () => ipcRenderer.invoke('get-app-settings'),
  updateTrayDevices: (devices) => ipcRenderer.send('update-tray-devices', devices),
  getScannedHidDevices: () => ipcRenderer.invoke('get-scanned-hid-devices'),
  onHidDevicesScanned: (callback) => {
    const handler = (event, list) => callback(list);
    ipcRenderer.on('hid-devices-scanned', handler);
    return () => ipcRenderer.removeListener('hid-devices-scanned', handler);
  },
  selectJsonFile: () => ipcRenderer.invoke('select-json-file'),
  saveDeviceDatabase: (dbData) => ipcRenderer.invoke('save-device-database', dbData),
  saveDeviceDatabaseBundle: (bundlePayload) => ipcRenderer.invoke('save-device-database-bundle', bundlePayload),
  loadDeviceDatabase: () => ipcRenderer.invoke('load-device-database'),
  exportGreenPatch: (dbObj) => ipcRenderer.invoke('export-green-patch', dbObj),
  downloadAndInstallApp: (url) => ipcRenderer.invoke('download-and-install-app', url),
  onDownloadProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },
  isElectron: true,
  onMaximizeChange: (callback) => {
    const handler = (event, isMax) => callback(isMax);
    ipcRenderer.on('window-maximize-change', handler);
    return () => ipcRenderer.removeListener('window-maximize-change', handler);
  },
  setZoomFactor: (factor) => {
    try {
      const { webFrame } = require('electron');
      webFrame.setZoomFactor(factor);
    } catch (e) {}
  },
  onShowDevice: (callback) => {
    const handler = (event, devId) => callback(devId);
    ipcRenderer.on('tray-show-device', handler);
    return () => ipcRenderer.removeListener('tray-show-device', handler);
  },
});
