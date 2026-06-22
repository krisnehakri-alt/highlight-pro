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
import { useLoaderData, useActionData, Form } from "react-router";
import { useEffect } from "react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { PLANS } from "../constants/plans";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const user = await prisma.user.findUnique({ where: { shop: session.shop } });

  // Safely check for active subscriptions, guard against undefined billing
  const activeSubscriptions = billing && typeof billing.check === "function"
    ? await billing.check({
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
    const { session, billing } = await authenticate.admin(request);
    const formData = await request.formData();
    const plan = formData.get("plan");
    console.log("Selected Plan:", plan);

    if (!plan) {
      return new Response(JSON.stringify({ error: "Plan not provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (plan === "FREE") {
      console.log("Downgrading to FREE");
      try {
        const activeSubscriptions = await billing.check({
          plans: ["STARTER", "PRO", "PREMIUM"],
          isTest: true,
        });

        if (activeSubscriptions.hasActivePayment && activeSubscriptions.appSubscriptions.length > 0) {
          const subscriptionId = activeSubscriptions.appSubscriptions[0].id;
          console.log("Cancelling subscription:", subscriptionId);
          await billing.cancel({
            subscriptionId: subscriptionId,
            isTest: true,
            prorate: true,
          });
        }
      } catch (cancelError) {
        console.error("Failed to cancel Shopify subscription:", cancelError);
        // Continue to update local DB even if cancellation fails or isn't found
      }

      console.log("Updating database to FREE");
      await prisma.user.update({
        where: { shop: session.shop },
        data: { subscriptionPlan: "FREE" }
      });
      
      return { success: true, plan: "FREE" };
    }

    console.log("Requesting Billing for plan:", plan);
    const billingResponse = await billing.request({
      plan: plan,
      isTest: true,
      returnUrl: `https://${session.shop}/admin/apps/highlight-pro/app/billing`,
    });
    return billingResponse;
  } catch (error) {
    if (error instanceof Response) {
      const location = error.headers.get("Location") || error.headers.get("X-Shopify-API-Request-Failure-Reauthorize-Url");
      if (location) {
        return { redirectUrl: location };
      }
      throw error;
    }
    console.error("[Billing action error]", error);
    return new Response(JSON.stringify({ 
      error: "Unable to process billing request", 
      details: error?.message || String(error),
      stack: error?.stack
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};


export default function Billing() {
  const { plan } = useLoaderData();
  const actionData = useActionData();

  useEffect(() => {
    if (actionData && actionData.redirectUrl) {
      if (window.shopify) {
        window.open(actionData.redirectUrl, "_top");
      } else {
        window.top.location.href = actionData.redirectUrl;
      }
    }
  }, [actionData]);

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

                        <Form method="post">
                          <input type="hidden" name="plan" value={p.name} />
                          <Button
                            fullWidth
                            variant="primary"
                            tone={isCurrentPlan ? "success" : p.color}
                            disabled={isCurrentPlan}
                            submit
                          >
                            {isCurrentPlan ? "Current Plan" : `Upgrade to ${p.name}`}
                          </Button>
                        </Form>
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
