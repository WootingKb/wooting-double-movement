import { set_config, start_service, stop_service } from "./native";
import { ServiceConfiguration } from "./types";

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
