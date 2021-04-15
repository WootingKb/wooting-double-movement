import { ipcRenderer, IpcRendererEvent } from "electron";
import { JoystickAngleConfiguration } from "src/native/types";
import { AppSettings } from "../common";

const storeChangedChannel = "store_changed";

async function store_get<Key extends keyof AppSettings>(
  name: Key
): Promise<AppSettings[Key]> {
  return await ipcRenderer.invoke("store_get", name);
}

function store_set<Key extends keyof AppSettings>(
  name: Key,
  value: AppSettings[Key]
) {
  ipcRenderer.send("store_set", name, value);
}

export class RemoteStore {
  static async doubleMovementEnabled(): Promise<boolean> {
    return await store_get("doubleMovementEnabled");
  }

  static setDoubleMovementEnabled(enabled: boolean) {
    store_set("doubleMovementEnabled", enabled);
  }

  static async leftJoystickAngles(): Promise<JoystickAngleConfiguration> {
    return await store_get("leftJoystickAngles");
  }

  static setLeftJoystickAngles(value: JoystickAngleConfiguration) {
    store_set("leftJoystickAngles", value);
  }

  /// Returns function to unsubscribe to changes
  static onChange<Key extends keyof AppSettings>(
    name: Key,
    callback: (value: AppSettings[Key]) => void
  ): () => void {
    function listener(_: IpcRendererEvent, cb_name: string, value: any) {
      console.debug("onChange listener got ", cb_name, value);
      if (name == cb_name) {
        callback(value as AppSettings[Key]);
      }
    }
    ipcRenderer.on(storeChangedChannel, listener);

    return () => {
      ipcRenderer.removeListener(storeChangedChannel, listener);
    };
  }
}
