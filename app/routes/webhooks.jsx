import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { topic, shop, session, admin, payload } = await authenticate.webhook(request);

  if (!admin) {
    // The admin context isn't returned if the webhook fired after a shop was uninstalled.
    throw new Response();
  }

  // Privacy compliance webhooks
  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
    case "SHOP_REDACT":
      // Shopify requires these webhooks to return a 200 OK immediately
      // Implement your privacy handling logic here in the future
      return new Response("Webhook handled", { status: 200 });
    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }
};
