import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Button,
  Grid,
  Badge,
} from "@shopify/polaris";
import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const user = await prisma.user.findUnique({ where: { shop } });
  
  return { plan: user?.subscriptionPlan || "FREE" };
};

const TEMPLATES = [
  { id: 1, name: "Clean Grid", plan: "FREE", color: "success", img: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png" },
  { id: 2, name: "Modern Cards", plan: "STARTER", color: "info", img: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png" },
  { id: 3, name: "Icon Focus", plan: "STARTER", color: "info", img: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png" },
  { id: 4, name: "Glassmorphism", plan: "PRO", color: "attention", img: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png" },
  { id: 5, name: "Advanced Layout", plan: "PRO", color: "attention", img: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png" },
  { id: 6, name: "Premium Animated", plan: "PREMIUM", color: "critical", img: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png" },
  { id: 7, name: "Gradient Flow", plan: "PREMIUM", color: "critical", img: "https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png" },
];

const PLAN_LEVELS = {
  "FREE": 0,
  "STARTER": 1,
  "PRO": 2,
  "PREMIUM": 3
};

export default function Templates() {
  const { plan } = useLoaderData();
  const navigate = useNavigate();
  const currentLevel = PLAN_LEVELS[plan];

  return (
    <Page 
      title="Template Library" 
      subtitle="Choose a design to start building your feature highlight section."
      backAction={{ content: "Dashboard", onAction: () => navigate("/app") }}
    >
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Grid>
              {TEMPLATES.map((template) => {
                const requiredLevel = PLAN_LEVELS[template.plan];
                const isLocked = currentLevel < requiredLevel;

                return (
                  <Grid.Cell key={template.id} columnSpan={{xs: 6, sm: 6, md: 4, lg: 4, xl: 4}}>
                    <Card padding="0">
                      {/* Image Placeholder */}
                      <div style={{ width: '100%', height: '180px', backgroundColor: '#f4f6f8', backgroundImage: `url(${template.img})`, backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: 'var(--p-border-radius-200)', borderTopRightRadius: 'var(--p-border-radius-200)' }}></div>
                      
                      <div style={{ padding: 'var(--p-space-400)' }}>
                        <BlockStack gap="300">
                          <InlineStack align="space-between" blockAlign="center">
                            <Text variant="headingMd" as="h3">{template.name}</Text>
                            <Badge tone={template.color}>{template.plan}</Badge>
                          </InlineStack>

                          {isLocked ? (
                            <Button 
                              fullWidth 
                              variant="primary" 
                              tone="critical"
                              onClick={() => navigate("/app/billing")}
                            >
                              Upgrade to Unlock
                            </Button>
                          ) : (
                            <Button 
                              fullWidth 
                              variant="primary"
                              onClick={() => navigate(`/app/create/${template.id}`)}
                            >
                              Use Template
                            </Button>
                          )}
                          <Button fullWidth>Live Demo</Button>
                        </BlockStack>
                      </div>
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
