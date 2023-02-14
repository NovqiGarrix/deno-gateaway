export default function isAURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_err) {
    return false;
  }
}
