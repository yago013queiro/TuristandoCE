export async function shareContent({ title, text, url }) {
  const shareUrl = url || window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: shareUrl });
      return true;
    } catch { /* user cancelled */ }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    return 'copied';
  } catch {
    return false;
  }
}
