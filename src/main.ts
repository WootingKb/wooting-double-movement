import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  shell,
  Tray,
} from "electron";
import { get_xinput_slot, start_service, stop_service } from "./native/native";
import ElectronStore from "electron-store";
import { AppSettings, smallWindowSize } from "./common";
import path from "path";
import install, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
import { create } from "domain";
import { setServiceConfig, startService, stopService } from "./native";
import {
  defaultJoystickAngles,
  defaultKeyMapping,
  JoystickAngleConfiguration,
  KeyMapping,
  ServiceConfiguration,
} from "./native/types";
import { Key } from "ts-keycode-enum";
import { log, functions } from "electron-log";
import { autoUpdater } from "electron-updater";

Object.assign(console, functions);
app.allowRendererProcessReuse = false;

declare var __dirname: any, process: any;

let mainWindow: Electron.BrowserWindow | null;

function isDev() {
  return process.mainModule.filename.indexOf("app.asar") === -1;
}

function registerHandlers() {
  ipcMain.on("windowClose", () => {
    mainWindow && mainWindow.close();
    app.quit();
  });

  ipcMain.on("windowMinimize", () => mainWindow && mainWindow.close());

  ipcMain.handle("getVersion", () => app.getVersion());

  ipcMain.on("resize-me", (_, width, height) => {
    console.debug(`Resize to ${width} ${height} requested`);
    if (mainWindow) {
      mainWindow.setMinimumSize(width, height);
      mainWindow.setSize(width, height, true);
    }
  });

  ipcMain.handle("update_restart_and_install", () =>
    autoUpdater.quitAndInstall()
  );
}

function createMainWindow() {
  if (mainWindow) {
    return;
  }

  mainWindow = new BrowserWindow({
    width: smallWindowSize[0],
    height: smallWindowSize[1],
    transparent: true,
    frame: false,
    resizable: false,
    show: false,
    fullscreenable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: false,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/../public/index.html`);

  // All new windows opened from the app are links, so open them
  // externally
  mainWindow.webContents.on("new-window", function (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.webContents.on("will-navigate", function (event, url) {
    event.preventDefault();
    shell.openExternal(url);
  });

  if (isDev()) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("ready-to-show", () => {
    if (!mainWindow) return;

    mainWindow.show();

    if (!isDev()) {
      autoUpdater.on("error", (e) =>
        mainWindow?.webContents.send("update_error", e)
      );
      autoUpdater.on("update-available", () =>
        mainWindow?.webContents.send("update_available")
      );
      autoUpdater.on("download-progress", ({ percent }) =>
        mainWindow?.webContents.send("update_progress", percent)
      );
      autoUpdater.on("update-downloaded", () =>
        mainWindow?.webContents.send("update_complete")
      );

      autoUpdater.checkForUpdates();
    }
  });

  mainWindow.on("closed", () => {
    app.removeAllListeners("browser-window-focus");
    app.removeAllListeners("browser-window-blur");
    mainWindow = null;
  });
}

const isSingleInstance = app.requestSingleInstanceLock();

if (isSingleInstance) {
  app.on("second-instance", () => mainWindow && mainWindow.show());
} else {
  app.quit();
}

app.on("ready", () => {
  serviceManager.init();
  registerHandlers();
  createMainWindow();
  create_tray();
  if (isDev()) {
    install(REACT_DEVELOPER_TOOLS, {
      loadExtensionOptions: { allowFileAccess: true },
    })
      .then((name: string) => console.log(`Added Extension:  ${name}`))
      .catch((err: string) => console.log("An error occurred: ", err));

    // installExtension(REDUX_DEVTOOLS)
    //   .then((name: string) => console.log(`Added Extension:  ${name}`))
    //   .catch((err: string) => console.log("An error occurred: ", err));
  }
});

app.on("window-all-closed", () => {});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  serviceManager.deinit();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

function showOrCreateMainWindow() {
  if (mainWindow) {
    mainWindow?.show();
  } else {
    createMainWindow();
  }
}

let tray: Tray | null = null;
const contextMenu = Menu.buildFromTemplate([
  {
    label: "Show Window",
    click: () => {
      showOrCreateMainWindow();
    },
  },
  {
    label: "Toggle Double Movement",
    type: "checkbox",
    //We can tell from the ServiceState whether the service is enabled or not
    checked: false,
    click: ({ checked }) => serviceManager.set_double_movement_enabled(checked),
  },
  { type: "separator" },
  {
    label: "Quit",
    click: () => app.quit(),
  },
]);

function create_tray() {
  if (!tray) {
    tray = new Tray(`${__dirname}/../build/icon.ico`);
    tray.setToolTip("Wooting Double Movement");
    tray.on("double-click", () => {
      showOrCreateMainWindow();
    });
    tray.on("click", () => {
      if (tray) {
        tray.popUpContextMenu();
      }
    });
  }

  contextMenu.items[1].checked = serviceManager.doubleMovementEnabled();
  tray.setContextMenu(contextMenu);
}

class ServiceManager {
  running: boolean = false;
  store = new ElectronStore<AppSettings>({
    defaults: {
      doubleMovementEnabled: false,
      leftJoystickAngles: defaultJoystickAngles,
      keyMapping: defaultKeyMapping,
    },
  });

  init() {
    if (this.store.get("doubleMovementEnabled")) {
      this.start();
    }

    ipcMain.handle("store_get", (_, name: string) => {
      return this.store.get(name);
    });

    ipcMain.on("store_set", (_, name: string, value) => {
      this.store.set(name, value);
      this.update_state();

      if (name == "leftJoystickAngles" || name === "keyMapping") {
        this.update_config();
      }
    });

    ipcMain.on("reset-advanced", (_) => {
      this.resetAdvancedConfig();
    });

    const ret = globalShortcut.register("CommandOrControl+Shift+X", () => {
      console.debug("CommandOrControl+Shift+X is pressed");
      this.set_double_movement_enabled(!this.doubleMovementEnabled());
    });

    if (!ret) {
      console.error("Failed to register globalShortcut");
    }
  }

  store_set<Key extends keyof AppSettings>(name: Key, value: AppSettings[Key]) {
    mainWindow?.webContents.send("store_changed", name, value);
    this.store.set(name, value);
  }

  doubleMovementEnabled(): boolean {
    return this.store.get("doubleMovementEnabled");
  }

  set_double_movement_enabled(value: boolean) {
    this.store_set("doubleMovementEnabled", value);
    this.update_state();
  }

  serviceConfiguration(): ServiceConfiguration {
    return {
      leftJoystickAngles: {
        ...defaultJoystickAngles,
        ...this.store.get("leftJoystickAngles"),
      },
      keyMapping: {
        ...defaultKeyMapping,
        ...this.store.get("keyMapping"),
      },
    };
  }

  resetAdvancedConfig() {
    this.store_set("keyMapping", defaultKeyMapping);
    this.store_set("leftJoystickAngles", defaultJoystickAngles);
    this.update_config();
  }

  update_config() {
    if (this.running) {
      setServiceConfig(this.serviceConfiguration());
    }
  }

  update_state() {
    create_tray();

    if (this.doubleMovementEnabled()) {
      this.start();
    } else {
      this.stop();
    }
  }

  deinit() {
    if (this.running) {
      this.stop();
    }
  }

  onError = (error: Error) => {
    console.error(error);
    dialog.showErrorBox(
      "Wooting Double Movement errored",
      `An unexpected error occurred in the service, it's going to be disabled, please try again.\n\nPlease ensure that "Nefarius Virtual Gamepad Emulation Bus" is correctly installed.\n\n${error}`
    );
    this.set_double_movement_enabled(false);
  };

  restart() {
    this.stop();
    this.start();
  }

  start() {
    if (!this.running) {
      try {
        if (!startService(this.serviceConfiguration(), this.onError)) {
          dialog.showErrorBox(
            "Wooting Double Movement Error",
            `An error occurred while starting the service.\n\nThis is likely caused by "Nefarius Virtual Gamepad Emulation Bus" not being correctly installed.\n\nPlease double check your installation. Quiting...`
          );
          app.quit();
        }

        setTimeout(() => {
          const slot = get_xinput_slot();
          if (slot != null && slot > 0) {
            dialog.showMessageBox({
              type: "error",
              title: "Player slot warning",
              message: `Wooting Double Movement's controller is not in player slot 1, rather slot ${
                slot + 1
              }. You might experience issues in game. \n\nRemove all connected controllers, remove any virtual controllers, and restart this app.`,
            });
          }
        }, 1000);
      } catch (e) {
        this.onError(e);
      }
      this.running = true;
    }
  }

  stop() {
    if (this.running) {
      stopService();
      this.running = false;
    }
  }
}
const serviceManager = new ServiceManager();
