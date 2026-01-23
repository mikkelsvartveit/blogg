const BROWSER_ID_KEY = "blogg_browser_id";
const COMMENTER_NAME_KEY = "blogg_commenter_name";

/**
 * Generates a UUID v4 string
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Gets the browser ID from localStorage, creating one if it doesn't exist.
 * This ID uniquely identifies this browser for likes and comments.
 */
export function getBrowserId(): string {
  let browserId = localStorage.getItem(BROWSER_ID_KEY);

  if (!browserId) {
    browserId = generateUUID();
    localStorage.setItem(BROWSER_ID_KEY, browserId);
  }

  return browserId;
}

/**
 * Gets the saved commenter name from localStorage, if any.
 */
export function getCommenterName(): string {
  return localStorage.getItem(COMMENTER_NAME_KEY) || "";
}

/**
 * Saves the commenter name to localStorage for future use.
 */
export function setCommenterName(name: string): void {
  localStorage.setItem(COMMENTER_NAME_KEY, name.trim());
}
