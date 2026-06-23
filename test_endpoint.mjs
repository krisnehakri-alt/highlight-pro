// Test all possible endpoint URLs
const urls = [
  'https://highlight-pro-alpha.vercel.app/api/section/latest',
  'https://highlight-pro-alpha.vercel.app/api/section/latest?shop=shivansh-test-store.myshopify.com',
  'https://highlight-pro-alpha.vercel.app/api/data',
];

for (const url of urls) {
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log(`\n=== ${url} ===`);
    console.log(`Status: ${res.status}`);
    console.log(`Content-Type: ${res.headers.get('content-type')}`);
    console.log(`Body (first 500 chars): ${text.substring(0, 500)}`);
  } catch (e) {
    console.log(`\n=== ${url} ===`);
    console.log(`Error: ${e.message}`);
  }
}
