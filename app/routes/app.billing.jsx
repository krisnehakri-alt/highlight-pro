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

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan");

  if (plan === "FREE") {
    // Cancel subscription logic here using Shopify GraphQL API if needed
    // For simplicity we just redirect
    return null;
  }

  await billing.request({
    session,
    plan: plan,
    isTest: true,
    returnUrl: `https://${session.shop}/admin/apps/highlight-pro/app/billing`,
  });

  return null;
};

const PLANS = [
  {
    name: "FREE",
    price: "$0",
    features: ["1 Clean Grid Design", "Basic Customization", "Unlimited Features", "Community Support"],
    color: "success"
  },
  {
    name: "STARTER",
    price: "$39/mo",
    features: ["Everything in Free", "Unlock Design 2 (Modern Cards)", "Unlock Design 3 (Icon Focus)", "Priority Support"],
    color: "info"
  },
  {
    name: "PRO",
    price: "$59/mo",
    features: ["Everything in Starter", "Unlock Design 4 (Glassmorphism)", "Unlock Design 5 (Advanced Layout)", "Remove Branding"],
    color: "attention"
  },
  {
    name: "PREMIUM",
    price: "$99/mo",
    features: ["Everything in Pro", "Unlock Design 6 (Premium Animated)", "Unlock Design 7 (Gradient Flow)", "Dedicated Account Manager"],
    color: "critical"
  }
];

export default function Billing() {
  const { plan } = useLoaderData();
  const submit = useSubmit();

  const handleSubscribe = (planName) => {
    submit({ plan: planName }, { method: "POST" });
  };

  return (
    <Page title="Pricing & Plans" subtitle="Unlock premium designs to elevate your storefront.">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Grid>
              {PLANS.map((p) => {
                const isCurrentPlan = plan === p.name;
                return (
                  <Grid.Cell key={p.name} columnSpan={{xs: 6, sm: 6, md: 3, lg: 3, xl: 3}}>
                    <Card background={isCurrentPlan ? "bg-surface-success" : "bg-surface"}>
                      <BlockStack gap="400">
                        <BlockStack gap="100">
                          <InlineStack align="space-between">
                            <Text variant="headingMd" as="h3">{p.name}</Text>
                            {isCurrentPlan && <Badge tone="success">Current Plan</Badge>}
                          </InlineStack>
                          <Text variant="heading3xl" as="p">{p.price}</Text>
                        </BlockStack>
                        
                        <List type="bullet">
                          {p.features.map(f => (
                            <List.Item key={f}>{f}</List.Item>
                          ))}
                        </List>

                        <Button 
                          fullWidth 
                          variant={isCurrentPlan ? "plain" : "primary"}
                          tone={p.color}
                          disabled={isCurrentPlan}
                          onClick={() => handleSubscribe(p.name)}
                        >
                          {isCurrentPlan ? "Active" : `Upgrade to ${p.name}`}
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
