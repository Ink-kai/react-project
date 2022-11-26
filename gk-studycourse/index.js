const { app, BrowserWindow, dialog,autoUpdater } = require('electron')
const path = require("path")
const log = require('electron-log');
const gotTheLock = app.requestSingleInstanceLock()
log.transports.file.resolvePathFn = () => path.join(__dirname, 'logs/main.log');

const server = '服务器地址'
const url = `${server}/update/${process.platform}/ ${app.getVersion()}`

autoUpdater.setFeedURL({ url })
setInterval(() => {
    autoUpdater.checkForUpdates()
}, 3600000)

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['重启', '稍后'],
      title: '应用更新',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: '应用已经更新了，请重启'
    }
  
    dialog.showMessageBox(dialogOpts).then((returnValue) =>{
      if(returnValue.response === 0) autoUpdater.quitAnd()
    })
  })

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
    log.info("关闭默认菜单")
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
