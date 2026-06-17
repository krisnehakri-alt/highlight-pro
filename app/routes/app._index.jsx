import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Grid,
  EmptyState,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "react-router";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Find or create user
  let user = await prisma.user.findUnique({
    where: { shop },
    include: { sections: true }
  });

  if (!user) {
    user = await prisma.user.create({
      data: { shop },
      include: { sections: true }
    });
  }

  const sections = user.sections || [];
  const totalSections = sections.length;
  const publishedSections = sections.filter(s => s.status === "PUBLISHED").length;
  const draftSections = sections.filter(s => s.status === "DRAFT").length;

  return { 
    user, 
    stats: { totalSections, publishedSections, draftSections },
    sections: sections.slice(0, 5) // Recent 5
  };
};

export default function Dashboard() {
  const { user, stats, sections } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Page title="Feature Highlights Dashboard">
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Grid>
              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">Total Sections</Text>
                    <Text variant="heading3xl" as="p">{stats.totalSections}</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">Published</Text>
                    <Text variant="heading3xl" as="p">{stats.publishedSections}</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">Drafts</Text>
                    <Text variant="heading3xl" as="p">{stats.draftSections}</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
              <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingSm" as="h3">Current Plan</Text>
                    <Text variant="heading3xl" as="p">{user.subscriptionPlan}</Text>
                  </BlockStack>
                </Card>
              </Grid.Cell>
            </Grid>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Quick Actions</Text>
                <InlineStack gap="300">
                  <Button variant="primary" onClick={() => navigate("/app/templates")}>Browse Templates</Button>
                  <Button onClick={() => navigate("/app/billing")}>Manage Billing</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Recent Sections</Text>
                {sections.length === 0 ? (
                  <EmptyState
                    heading="No sections created yet"
                    action={{
                      content: 'Browse Templates',
                      onAction: () => navigate("/app/templates"),
                    }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>Start highlighting your features by creating a new section from our template library.</p>
                  </EmptyState>
                ) : (
                  <BlockStack gap="200">
                    {sections.map(section => (
                      <Card key={section.id} background="bg-surface-secondary">
                        <InlineStack align="space-between" blockAlign="center">
                          <BlockStack gap="100">
                            <Text variant="headingSm" as="h3">{section.title}</Text>
                            <Text tone="subdued" as="p">Template {section.templateId} • {section.status}</Text>
                          </BlockStack>
                          <Button onClick={() => navigate(`/app/create/${section.templateId}?id=${section.id}`)}>Edit</Button>
                        </InlineStack>
                      </Card>
                    ))}
                  </BlockStack>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
