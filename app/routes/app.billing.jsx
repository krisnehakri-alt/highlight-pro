import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Grid,
  List,
  Badge,
  Image,
} from "@shopify/polaris";
import { useLoaderData, useSubmit } from "react-router";
import { authenticate, billing } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const user = await prisma.user.findUnique({ where: { shop: session.shop } });

  // Actually checking the billing API for active subscriptions
  // Safely check for active subscriptions, guard against undefined billing
  const activeSubscriptions = billing && typeof billing.check === "function"
    ? await billing.check({
      session,
      plans: ["STARTER", "PRO", "PREMIUM"],
      isTest: true,
    })
    : { hasActivePayment: false, appSubscriptions: [] };


  const currentPlan = activeSubscriptions.hasActivePayment ?
    (activeSubscriptions.appSubscriptions[0]?.name || "FREE") : "FREE";

  // Update DB if out of sync
  if (user && user.subscriptionPlan !== currentPlan) {
    await prisma.user.update({
      where: { shop: session.shop },
      data: { subscriptionPlan: currentPlan }
    });
  }

  return { plan: currentPlan };
};

export async function action({ request }) {
  console.log("===== ACTION CALLED =====");

  try {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const plan = formData.get("plan");
    console.log("Selected Plan:", plan);

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan not provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // No billing needed for the FREE plan
    if (plan === "FREE") {
      return null;
    }

    // billing.request() throws a redirect Response to Shopify's checkout page
    console.log("Requesting Billing for plan:", plan);
    await billing.request({
      session,
      plan,
      isTest: true,
      returnUrl: `https://${session.shop}/admin/apps/highlight-pro/app/billing`,
    });

    return null;
  } catch (error) {
    // billing.request() throws a Response redirect — re-throw it so
    // the browser actually navigates to Shopify's checkout page
    if (error instanceof Response) {
      throw error;
    }
    console.error("[Billing action error]", error);
    return new Response(JSON.stringify({ error: "Unable to process billing request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const PLANS = [
  {
    name: "FREE",
    price: "$0",
    features: ["1 Clean Grid Design", "Basic Customization", "Unlimited Features", "Community Support"],
    color: "success"
  },
  {
    name: "STARTER",
    price: "$49/mo",
    features: ["Everything in Free", "Unlock Design 2 (Modern Cards)", "Unlock Design 3 (Icon Focus)", "Priority Support"],
    color: "info"
  },
  {
    name: "PRO",
    price: "$99/mo",
    features: ["Everything in Starter", "Unlock Design 2 (Glassmorphism)", "Unlock Design 5 (Advanced Layout)", "Remove Branding"],
    color: "attention"
  },
  {
    name: "PREMIUM",
    price: "$119/mo",
    features: ["Everything in Pro", "Unlock Design 2 (Premium Animated)", "Unlock Design 7 (Gradient Flow)", "Dedicated Account Manager"],
    color: "success"
  }
];

export default function Billing() {
  const { plan } = useLoaderData();
  const submit = useSubmit();

  // Submit billing request for selected plan
  const handleUpgrade = (planName) => {
    submit(
      { plan: planName },
      { method: "post", replace: false }
    );
  };

  return (
    <Page title="Pricing & Plans" subtitle="Unlock premium designs to elevate your storefront.">
      <BlockStack gap="500">
        <Image
          source="https://via.placeholder.com/1200x300?text=Pricing+Banner"
          alt="Pricing banner"
        />
        <Layout>
          <Layout.Section>
            <Grid>
              {PLANS.map((p) => {
                const isCurrentPlan = plan === p.name;
                return (
                  <Grid.Cell key={p.name} columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}>
                    <Card background="bg-surface">
                      <BlockStack gap="400">
                        <BlockStack gap="100">
                          <InlineStack align="space-between">
                            <Text variant="headingMd" as="h3">{p.name}</Text>
                            {isCurrentPlan && <Badge tone="success">Current Plan</Badge>}
                          </InlineStack>
                          <Text
                            as="p"
                            variant="heading2xl"
                            fontWeight="bold"
                          >
                            {p.price}
                          </Text>
                        </BlockStack>

                        <List type="bullet">
                          {p.features.map(f => (
                            <List.Item key={f}>{f}</List.Item>
                          ))}
                        </List>

                        <Button
                          fullWidth
                          variant="primary"
                          tone={isCurrentPlan ? "success" : p.color}
                          disabled={isCurrentPlan}
                          onClick={() => handleUpgrade(p.name)}
                        >
                          {isCurrentPlan ? "Current Plan" : `Upgrade to ${p.name}`}
                        </Button>
                      </BlockStack>
                    </Card>
                  </Grid.Cell>
                );
              })}
            </Grid>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
