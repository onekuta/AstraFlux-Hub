const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

async function clickAt(win, selector) {
  const coords = await win.webContents.executeJavaScript(`
    (() => {
      const sel = ${JSON.stringify(selector)};
      let el = document.querySelector(sel);
      if (!el) {
        const all = Array.from(document.querySelectorAll('button, div, span'));
        el = all.find(e => e.textContent && e.textContent.trim().startsWith(sel));
      }
      if (el) {
        el.scrollIntoView({ block: 'center', inline: 'center' });
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      }
      return null;
    })()
  `);
  if (!coords) {
    console.log('clickAt: element not found for', selector);
    return false;
  }
  win.webContents.sendInputEvent({ type: 'mouseMove', x: coords.x, y: coords.y });
  await new Promise(r => setTimeout(r, 80));
  win.webContents.sendInputEvent({ type: 'mouseDown', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 80));
  win.webContents.sendInputEvent({ type: 'mouseUp', x: coords.x, y: coords.y, button: 'left', clickCount: 1 });
  return true;
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1380,
    height: 880,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const fullUrl = pathToFileURL(path.join(__dirname, '../dist/index.html')).href + '?view=device&tab=advanced&profile=ae64&theme=light';
  await win.loadURL(fullUrl);
  await new Promise(r => setTimeout(r, 2000));

  // 1. Check if top virtual keyboard keycaps have draggable attribute
  const dragCheck = await win.webContents.executeJavaScript(`
    (() => {
      const keyZ = document.querySelector('[data-key-id="KeyZ"]');
      const allKeys = Array.from(document.querySelectorAll('[data-key-id]'));
      const draggableCount = allKeys.filter(k => k.draggable).length;
      return {
        keyZExists: !!keyZ,
        keyZDraggable: keyZ ? keyZ.draggable : false,
        totalKeys: allKeys.length,
        draggableCount
      };
    })()
  `);
  console.log('Top keyboard draggable check:', dragCheck);

  // 2. Click DKS card to enter DKS editor
  await win.webContents.executeJavaScript(`
    const card = document.querySelector('[data-mode-id="DKS"]');
    if (card) {
      card.click();
    }
  `);
  await new Promise(r => setTimeout(r, 1200));

  // 3. Simulate dragging Key Z from top keyboard to Row 2 slot (as in user's red arrow)
  const dragResult = await win.webContents.executeJavaScript(`
    (() => {
      const source = document.querySelector('[data-key-id="KeyZ"]');
      const targetSlot = document.querySelector('[data-slot-id="dks_row_1"]');
      const targetRow = document.querySelector('[data-dks-row="1"]');
      if (!source || (!targetSlot && !targetRow)) {
        return { success: false, reason: 'elements not found', hasSource: !!source, hasTargetSlot: !!targetSlot, hasTargetRow: !!targetRow };
      }

      // Create DragEvent with DataTransfer
      const dt = new DataTransfer();
      dt.setData('text/plain', 'Z');
      dt.setData('application/sparklink-key', JSON.stringify({ id: 'KeyZ', label: 'Z', char: 'Z' }));

      // Dispatch dragstart on key Z
      source.dispatchEvent(new DragEvent('dragstart', { dataTransfer: dt, bubbles: true, cancelable: true }));

      // Dispatch dragover & drop on targetSlot
      const target = targetSlot || targetRow;
      target.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
      target.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));

      // Dispatch dragend
      source.dispatchEvent(new DragEvent('dragend', { dataTransfer: dt, bubbles: true, cancelable: true }));

      return {
        success: true
      };
    })()
  `);
  console.log('Drag and drop Key Z to DKS Row 2 result:', dragResult);
  await new Promise(r => setTimeout(r, 1000));

  // 4. Also drag Key X from top keyboard to DKS Row 1
  await win.webContents.executeJavaScript(`
    (() => {
      const source = document.querySelector('[data-key-id="KeyX"]');
      const target = document.querySelector('[data-slot-id="dks_row_0"]') || document.querySelector('[data-dks-row="0"]');
      if (source && target) {
        const dt = new DataTransfer();
        dt.setData('text/plain', 'X');
        target.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true }));
        target.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
      }
    })()
  `);
  await new Promise(r => setTimeout(r, 1000));

  // Verify the values in the slots
  const slotValues = await win.webContents.executeJavaScript(`
    (() => {
      const row0 = document.querySelector('[data-slot-id="dks_row_0"]');
      const row1 = document.querySelector('[data-slot-id="dks_row_1"]');
      const bind = document.querySelector('.panel-operation')?.innerText;
      return {
        row0Text: row0 ? row0.textContent.trim() : null,
        row1Text: row1 ? row1.textContent.trim() : null,
      };
    })()
  `);
  console.log('Slot values after drag-and-drop:', slotValues);

  // Capture screenshot of DKS editor with dragged keys
  const img = await win.webContents.capturePage();
  const outPath = 'C:/Users/Lynan/.gemini/antigravity/brain/babc9b26-a62e-4b1e-955d-2be516999335/verify_dks_drag_drop.png';
  fs.writeFileSync(outPath, img.toPNG());
  console.log('Captured screenshot to:', outPath);

  app.quit();
});
