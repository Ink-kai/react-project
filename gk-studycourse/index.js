const { app, BrowserWindow, Menu } = require('electron')
const path = require("path")
const log = require('electron-log');
const gotTheLock = app.requestSingleInstanceLock()
const { autoUpdater } = require("electron-updater");

log.transports.file.resolvePathFn = () => path.join(__dirname, 'logs/main.log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';


let win
function createWindow() {
    win = new BrowserWindow({
        width: 1420, height: 800, icon: path.resolve(__dirname, "./gkstudycourse.jpg"),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: true,
            webSecurity: true,
            nodeIntegrationInSubFrames: true,
            nodeIntegrationInWorker: true,
            preload: path.resolve(__dirname, "preload.js"),
            partition: String(+new Date()),
        }
    })
    win.loadURL("http://one.ouchn.cn/",
        {
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"
        }
    )
    // win.webContents.closeDevTools()
    win.webContents.openDevTools()
    win.once('ready-to-show', () => {
        win.show();
    })
    Menu.setApplicationMenu(null)
    // log.info("关闭默认菜单")
}
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
    app.on("web-contents-created", (event, w) => {
        w.send("event", 111111111111)
        w.setWindowOpenHandler((details) => {
            log.info(`正在前往 ${details.url}`)
            win.loadURL(details.url, { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36" })
            return { "action": "deny" }
        })
    })

    app.whenReady().then(() => {
        createWindow()
        autoUpdater.checkForUpdatesAndNotify();
        app.on('activate', function () {
            if (win || BrowserWindow.getAllWindows().length === 0) createWindow()
        })
    })
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.');
})

autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
})

autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
});


function sendStatusToWindow(text) {
    mainWindow.webContents.send('message', text);
}