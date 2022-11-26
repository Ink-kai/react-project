const { app, BrowserWindow } = require('electron')
const path = require("path")
const gotTheLock = app.requestSingleInstanceLock()
require('update-electron-app')()
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
}
if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // 用户正在尝试运行第二个实例，我们需要让焦点指向我们的窗口
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })
    app.on("web-contents-created", (event, w) => {
        w.setWindowOpenHandler((details) => {
            win.loadURL(details.url, { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36" })
            return { "action": "deny" }
        })
    })

    app.whenReady().then(() => {
        createWindow()
        // win.webContents.on('did-finish-load', () => {
        //     win.webContents.send("load", { "win": win.webContents });

        // })
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
