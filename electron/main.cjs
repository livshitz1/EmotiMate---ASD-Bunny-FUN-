const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: true, // Enable frame for window dragging
    titleBarStyle: 'default', // Use default title bar for better dragging
    movable: true, // Explicitly enable window movement
    resizable: true, // Enable resizing
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    backgroundColor: '#f0f0f0',
    show: false,
  });

  // Load the app
  if (isDev) {
    // Try different ports in case 3000 is taken
    const ports = [3000, 3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008, 3009];
    let portIndex = 0;
    
    const tryLoad = () => {
      if (portIndex >= ports.length) {
        console.error('Could not connect to dev server on any port');
        return;
      }
      
      const port = ports[portIndex];
      console.log(`Trying to connect to http://localhost:${port}...`);
      
      mainWindow.loadURL(`http://localhost:${port}`).then(() => {
        console.log(`✅ Connected to http://localhost:${port}`);
      }).catch((err) => {
        console.log(`❌ Failed to connect to http://localhost:${port}, trying next port...`);
        portIndex++;
        setTimeout(tryLoad, 1000);
      });
    };
    
    tryLoad();
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});
