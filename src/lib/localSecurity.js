const PIN_KEY = 'drivedebt_local_lock_pin';
const DEFAULT_PIN = '2570';

export function getLocalPin() {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

export function setLocalPin(pin) {
  localStorage.setItem(PIN_KEY, String(pin));
}

export function isValidPin(pin) {
  return /^\d{4,8}$/.test(String(pin || ''));
}
