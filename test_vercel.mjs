const urls = [
  'https://highlight-pro-alpha.vercel.app/app/templates',
  'https://highlight-pro-alpha.vercel.app/api/storefront/section?shop=shivansh-test-store.myshopify.com',
];

for (const url of urls) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`\n=== ${url} ===`);
    console.log(`Status: ${res.status}`);
    console.log(`Body (first 300): ${text.substring(0, 300)}`);
  } catch (e) {
    console.log(`\n=== ${url} ERROR: ${e.message}`);
  }
}
