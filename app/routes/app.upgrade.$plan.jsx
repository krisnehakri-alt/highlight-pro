import { useLoaderData, Link, useNavigate } from "react-router";
import { redirect } from "react-router";
import { Page, Layout, Card, BlockStack, Text, Button } from "@shopify/polaris";
import { PLANS } from "./app.billing";

// Loader to fetch plan details based on URL param
export const loader = async ({ params }) => {
  const planKey = params.plan?.toUpperCase();
  const plan = PLANS.find((p) => p.name === planKey);
  if (!plan) {
    // If plan not found, redirect to pricing page
    return redirect("/app");
  }
  return { plan };
};

export default function UpgradePlan() {
  const { plan } = useLoaderData();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Placeholder: navigate to billing action with plan name
    navigate(`/app/billing`, { replace: false });
  };

  return (
    <Page title={`${plan.name} Plan Upgrade`} subtitle={plan.price}>
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <BlockStack gap="500">
              <Text variant="headingMd" as="h2">
                {plan.name} – {plan.price}
              </Text>
              <ul>
                {plan.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Button primary onClick={handleCheckout}>
                Continue to Checkout
              </Button>
              <Link to="/app">← Back to Pricing</Link>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
