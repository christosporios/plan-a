// Hero image per proposal, auto-detected from src/assets/proposals/NN.jpg.
// Drop a new NN.jpg in that folder and it's picked up automatically; proposals
// without an image fall back to a themed placeholder in the UI.
const files = import.meta.glob('../assets/proposals/*.jpg', { eager: true, query: '?url', import: 'default' });

const byNumber = {};
for (const [path, url] of Object.entries(files)) {
  const m = path.match(/(\d+)\.jpg$/);
  if (m) byNumber[parseInt(m[1], 10)] = url;
}

// Returns the image URL for a proposal number, or null if none exists yet.
export function proposalImage(number) {
  return byNumber[Number(number)] ?? null;
}
