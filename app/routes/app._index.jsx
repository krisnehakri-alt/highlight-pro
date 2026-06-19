import { Page, BlockStack, Text } from "@shopify/polaris";
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
      <Layout>
        <Layout.Section>
          <Card title="Welcome" sectioned>
            <Text variant="bodyLg" as="p">
              Welcome back! Here’s a quick overview of your Highlight Pro account.
            </Text>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Subscription" sectioned>
            <Text variant="headingMd" as="h3">
              Current Plan: {plan}
            </Text>
            <Button primary onClick={() => navigate("/app/billing")}>Upgrade / Manage</Button>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Recent Templates" subsectioned>
            <Text variant="bodySm" tone="subdued">
              Quickly access your most used templates.
            </Text>
            {/* Placeholder grid – can be populated with real data later */}
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 3 }}>
                <Card title="Template 1" subdued>
                  <Text>Preview info</Text>
                </Card>
              </Grid.Cell>
              <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 3 }}>
                <Card title="Template 2" subdued>
                  <Text>Preview info</Text>
                </Card>
              </Grid.Cell>
            </Grid>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
