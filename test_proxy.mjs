// Test App Proxy from storefront side
const urls = [
  'https://shivansh-test-store.myshopify.com/apps/feature-highlights/api/section/latest',
  'https://highlight-pro-alpha.vercel.app/api/section/latest',
];

for (const url of urls) {
  try {
    const res = await fetch(url, { redirect: 'follow' });
    const text = await res.text();
    console.log(`\n=== ${url} ===`);
    console.log(`Status: ${res.status}`);
    console.log(`Headers:`, Object.fromEntries(res.headers.entries()));
    console.log(`Body (first 500 chars): ${text.substring(0, 500)}`);
  } catch (e) {
    console.log(`\n=== ${url} ===`);
    console.log(`Error: ${e.message}`);
  }
}
