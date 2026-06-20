// Dashboard route removed as per requirements
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const user = await prisma.user.findUnique({ where: { shop } });
  return { plan: user?.subscriptionPlan || "FREE" };
};

export default function Dashboard() {
  const { plan } = useLoaderData();
  return (
    <Page title="Dashboard" subtitle="Welcome to Highlight Pro">
      <BlockStack gap="500">
        <Text variant="bodyLg" as="p">
          This is your dashboard. Use the navigation on the left to access Templates or Pricing.
        </Text>
      </BlockStack>
    </Page>
  );
}
