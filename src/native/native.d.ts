export function start_service(
  config: string,
  onError: (error: Error) => void
): boolean;
export function stop_service();
export function get_xinput_slot(): number | null;
export function get_sdk_state(): string | null;
export function set_config(config: string);
export function start_gamepad_detection();
export function end_gamepad_detection();
