import { ipcRenderer, IpcRendererEvent } from "electron";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
  defaultSettings,
  JoystickAngleConfiguration,
  SDKState,
} from "native/types";
import { AppSettings } from "./common";

const storeChangedChannel = "store_changed";
const sdkStateChangedChannel = "sdk_state_changed";

export class RemoteStore {
  public static settingCache: AppSettings = defaultSettings;
  public static sdkStateCache: SDKState = { type: "Uninitialized" };

  static async init() {
    await this.syncCache();

    // Listener for keeping the cache in-sync
    const listener = (__: IpcRendererEvent, cb_name: string, value: any) => {
      const name = cb_name as keyof AppSettings;
      if (!_.isEqual(this.settingCache[name], value))
        this.settingCache[name] = value;
    };

    ipcRenderer.on(storeChangedChannel, listener);

    this.sdkStateCache = await this.getSDKState();
    this.onSDKStateChange((state: SDKState) => {
      this.sdkStateCache = state;
    });
  }

  static async getSDKState(): Promise<SDKState> {
    return (await ipcRenderer.invoke("get_sdk_state")) as SDKState;
  }

  static onSDKStateChange(callback: (state: SDKState) => void): () => void {
    const listener = (__: IpcRendererEvent, state: SDKState) => {
      callback(state);
    };
    ipcRenderer.on(sdkStateChangedChannel, listener);
    return () => {
      ipcRenderer.removeListener(sdkStateChangedChannel, listener);
    };
  }

  static async syncCache() {
    console.log("Syncing cache");
    this.settingCache = await ipcRenderer.invoke("store_getAll");
  }

  static async getValue<Key extends keyof AppSettings>(
    name: Key
  ): Promise<AppSettings[Key]> {
    return await ipcRenderer.invoke("store_get", name);
  }

  static setValue<Key extends keyof AppSettings>(
    name: Key,
    value: AppSettings[Key]
  ) {
    ipcRenderer.send("store_set", name, value);
    // No need to sync values here with the cache as if the set is successful the value change callback set up in init
    // will be called and update the cache
  }

  static async doubleMovementEnabled(): Promise<boolean> {
    return await this.getValue("doubleMovementEnabled");
  }

  static setDoubleMovementEnabled(enabled: boolean) {
    this.setValue("doubleMovementEnabled", enabled);
  }

  static async leftJoystickAngles(): Promise<JoystickAngleConfiguration> {
    return await this.getValue("leftJoystickStrafingAngles");
  }

  static setLeftJoystickAngles(value: JoystickAngleConfiguration) {
    this.setValue("leftJoystickStrafingAngles", value);
  }

  /// Returns function to unsubscribe to changes
  static onChange<Key extends keyof AppSettings>(
    name: Key,
    callback: (value: AppSettings[Key]) => void
  ): () => void {
    const listener = (__: IpcRendererEvent, cb_name: string, value: any) => {
      if (name == cb_name) {
        console.debug("onChange listener got ", cb_name, value);
        callback(value as AppSettings[Key]);
      }
    };

    ipcRenderer.on(storeChangedChannel, listener);

    return () => {
      ipcRenderer.removeListener(storeChangedChannel, listener);
    };
  }

  static resetStrafingSettings() {
    ipcRenderer.send("reset-advanced-strafing");
  }

  static resetBindSettings() {
    ipcRenderer.send("reset-advanced-bind");
  }

  static resetSettings() {
    RemoteStore.resetBindSettings();
    RemoteStore.resetStrafingSettings();
  }
}

export function useRemoteValue<Key extends keyof AppSettings>(
  name: Key
): [AppSettings[Key], (value: AppSettings[Key]) => void] {
  const [value, _setValue] = useState<AppSettings[Key]>(
    RemoteStore.settingCache[name]
  );

  useEffect(() => {
    // We just do a call to getValue initially to make sure the state value is accurate
    // This is to ensure that if the useRemoteValue occurs before the sync takes place that it will be updated with the correct value
    RemoteStore.getValue(name).then((value) => {
      _setValue((v) => (_.isEqual(value, v) ? v : value));
    });

    const unsubscribe = RemoteStore.onChange(name, (value) => {
      _setValue((v) => (_.isEqual(value, v) ? v : value));
    });

    return unsubscribe;
  }, []);

  function setValue(value: AppSettings[Key]) {
    _setValue(value);
    RemoteStore.setValue(name, value);
  }

  return [value, setValue];
}

export function useSDKState(): SDKState {
  const [value, _setValue] = useState<SDKState>(RemoteStore.sdkStateCache);

  useEffect(() => {
    // We just do a call to getValue initially to make sure the state value is accurate
    // This is to ensure that if the useRemoteValue occurs before the sync takes place that it will be updated with the correct value
    RemoteStore.getSDKState().then((value) => {
      _setValue((v) => (_.isEqual(value, v) ? v : value));
    });

    const unsubscribe = RemoteStore.onSDKStateChange((value) => {
      _setValue((v) => (_.isEqual(value, v) ? v : value));
    });

    return unsubscribe;
  }, []);

  return value;
}

export function setWindowSize(width: number, height: number) {
  ipcRenderer.send("resize-me", width, height);
}
