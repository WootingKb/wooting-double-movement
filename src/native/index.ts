import { get_sdk_state, set_config, start_service, stop_service } from "./native";
import { ServiceConfiguration, SDKState } from "./types";

export function startService(
  config: ServiceConfiguration,
  onError: (error: Error) => void
): boolean {
  return start_service(JSON.stringify(config), onError);
}
export function stopService() {
  stop_service();
}

export function setServiceConfig(config: ServiceConfiguration) {
  set_config(JSON.stringify(config));
}

export function getSDKState(): SDKState {
  const raw_state = get_sdk_state()
  if (raw_state) {
    
    return JSON.parse(raw_state);
  } else {
    return { type: 'Uninitialized' }
  }
}
