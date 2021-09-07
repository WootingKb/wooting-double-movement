import { ipcRenderer, IpcRendererEvent } from "electron";
import _ from "lodash";
import { useEffect, useState } from "react";
import { JoystickAngleConfiguration } from "native/types";
import { AppSettings } from "./common";

const storeChangedChannel = "store_changed";

export class RemoteStore {
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
    function listener(_: IpcRendererEvent, cb_name: string, value: any) {
      if (name == cb_name) {
        console.debug("onChange listener got ", cb_name, value);
        callback(value as AppSettings[Key]);
      }
    }

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
  name: Key,
  initialState: AppSettings[Key]
): [AppSettings[Key], (value: AppSettings[Key]) => void] {
  const [value, _setValue] = useState<AppSettings[Key]>(initialState);

  useEffect(() => {
    RemoteStore.getValue(name).then((value) => {
      _setValue(value);
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

export function setWindowSize(width: number, height: number) {
  ipcRenderer.send("resize-me", width, height);
}
