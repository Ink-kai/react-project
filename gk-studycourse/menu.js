const { Menu } = require("electron/main");

const menuItem = [
    {
        label: "个人管理",
        submenu: [
            {
                label: "刷新",
                accelerator:"F5",
                click() {
                    console.log("点我刷了");
                }
            }
        ]
    }
]
const menu = Menu.buildFromTemplate(menuItem)
Menu.setApplicationMenu(null)