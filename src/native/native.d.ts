export function start_service(
  config: string,
  onError: (error: Error) => void
): boolean;
export function stop_service();
export function get_xinput_slot(): number | null;
export function set_config(config: string);
