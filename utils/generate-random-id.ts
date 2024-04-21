export function generateRandomId() {
  return (Math.random() * 36).toString(36).substring(2);
}
