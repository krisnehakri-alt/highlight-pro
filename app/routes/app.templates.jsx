import { useState, useCallback } from "react";
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
  Tabs,
  Modal,
  Icon,
  Box
} from "@shopify/polaris";
import { LockIcon } from '@shopify/polaris-icons';
import { useNavigate, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }) => {
  const { session, billing } = await authenticate.admin(request);
  const shop = session.shop;

  // Enforce billing: User must have one of these plans.
  // If not, redirect them immediately to the Shopify Approval Page for STARTER.
  const { hasActivePayment, appSubscriptions } = await billing.require({
    plans: ["STARTER", "PRO", "PREMIUM"],
    isTest: true,
    onFailure: async () => billing.request({
      plan: "STARTER",
      isTest: true,
      returnUrl: `https://${shop}/admin/apps/highlight-pro/app/templates`,
    }),
  });

  const user = await prisma.user.findUnique({ where: { shop } });
  const currentPlan = hasActivePayment ? appSubscriptions[0]?.name : "STARTER";

  // Update DB with the current active plan
  if (user && user.subscriptionPlan !== currentPlan) {
    await prisma.user.update({
      where: { shop },
      data: { subscriptionPlan: currentPlan }
    });
  }

  return { plan: currentPlan };
};

const TEMPLATES = [
  {
    id: 1,
    name: "Design 1",
    plan: "Free",
    price: "$0",
    category: "Free",
    locked: false,
    previewStyle: { background: "#fdfdfd" },
    title: "Why Choose Us?",
    features: [
      { title: "Fast Delivery", subtitle: "Delivery in 24 hours", iconColor: "#00a060" },
      { title: "Secure Payment", subtitle: "100% safe checkout", iconColor: "#2c6ecb" },
      { title: "24/7 Support", subtitle: "We are always available", iconColor: "#2c6ecb" },
    ]
  },
  {
    id: 2,
    name: "Design 2",
    plan: "Starter",
    price: "$49/month",
    category: "Starter",
    locked: true,
    previewStyle: { background: "linear-gradient(135deg, #f3e8ff 0%, #e0caff 100%)" },
    title: "Why Choose Us?",
    features: [
      { title: "Fast Delivery", subtitle: "Delivery in 24 hours", iconColor: "#2c6ecb" },
      { title: "Secure Payment", subtitle: "100% safe checkout", iconColor: "#8a2be2" },
      { title: "24/7 Support", subtitle: "We are always available", iconColor: "#8a2be2" },
    ]
  },
  {
    id: 3,
    name: "Design 3",
    plan: "Starter",
    price: "$49/month",
    category: "Starter",
    locked: true,
    previewStyle: { background: "linear-gradient(135deg, #ffe4e6 0%, #fce7f3 100%)" },
    title: "Why Choose Us?",
    features: [
      { title: "Fast Delivery", subtitle: "Delivery in 24 hours", iconColor: "#8a2be2" },
      { title: "Secure Payment", subtitle: "100% safe checkout", iconColor: "#d2691e" },
      { title: "Money Guarantee", subtitle: "30 days money back", iconColor: "#dc143c" },
      { title: "24/7 Support", subtitle: "We are always available", iconColor: "#dc143c" },
    ]
  },
  {
    id: 4,
    name: "Design 4",
    plan: "Pro",
    price: "$99/month",
    category: "Pro",
    locked: true,
    previewStyle: { background: "#0f172a", color: "white" },
    title: "Why Choose Us?",
    features: [
      { title: "Fast Delivery", subtitle: "Delivery in 24 hours", iconColor: "#3b82f6" },
      { title: "Easy Returns", subtitle: "30 days return policy", iconColor: "#eab308" },
      { title: "Secure Payment", subtitle: "100% safe checkout", iconColor: "#eab308" },
      { title: "24/7 Support", subtitle: "We are always available", iconColor: "#eab308" },
    ],
    cardStyle: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }
  },
  {
    id: 5,
    name: "Design 5",
    plan: "Pro",
    price: "$99/month",
    category: "Pro",
    locked: true,
    previewStyle: { background: "linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%)" },
    title: "Why Choose Us?",
    features: [
      { title: "Easy Returns", subtitle: "30 days return policy", iconColor: "#d97706" },
      { title: "Best Quality", subtitle: "Premium quality", iconColor: "#dc2626" },
      { title: "Secure Payment", subtitle: "100% safe checkout", iconColor: "#0891b2" },
      { title: "24/7 Support", subtitle: "We are always available", iconColor: "#0891b2" },
    ]
  },
  {
    id: 6,
    name: "Design 6",
    plan: "Premium",
    price: "$119/month",
    category: "Premium",
    locked: true,
    previewStyle: { background: "#064e3b", color: "white" },
    title: "Why Choose Us?",
    features: [
      { title: "Free Shipping", subtitle: "Free shipping on all orders", iconColor: "#10b981" },
      { title: "Price Guarantee", subtitle: "Best price guarantee", iconColor: "#f59e0b" },
      { title: "Easy Exchanges", subtitle: "Hassle free exchanges", iconColor: "#f59e0b" },
      { title: "24/7 Support", subtitle: "We are always available", iconColor: "#f59e0b" },
    ],
    cardStyle: { background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)", color: "white" }
  },
  {
    id: 7,
    name: "Design 7",
    plan: "Premium",
    price: "$119/month",
    category: "Premium",
    locked: true,
    previewStyle: { background: "#171717", color: "white" },
    title: "Why Choose Us?",
    features: [
      { title: "Enterprise Grade", subtitle: "Built for scale & performance", iconColor: "#ef4444" },
      { title: "Top Security", subtitle: "Bank-level security", iconColor: "#eab308" },
      { title: "Premium Support", subtitle: "Dedicated account manager", iconColor: "#10b981" },
      { title: "Reliable Uptime", subtitle: "99.9% uptime guarantee", iconColor: "#ef4444" },
    ],
    cardStyle: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }
  },
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
  const currentLevel = PLAN_LEVELS[plan] || 0;

  const [selected, setSelected] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const handlePreview = (template) => {
    setActiveTemplate(template);
    setPreviewOpen(true);
  };

  const tabs = [
    { id: 'all', content: 'All (7)' },
    { id: 'free', content: 'Free (1)' },
    { id: 'starter', content: 'Starter ($49) (2)' },
    { id: 'pro', content: 'Pro ($99) (2)' },
    { id: 'premium', content: 'Premium ($119) (2)' },
  ];

  const filteredTemplates = TEMPLATES.filter((template) => {
    if (selected === 0) return true;
    if (selected === 1) return template.category === 'Free';
    if (selected === 2) return template.category === 'Starter';
    if (selected === 3) return template.category === 'Pro';
    if (selected === 4) return template.category === 'Premium';
    return true;
  });

  return (
    <Page
      title="Templates"
      subtitle="Choose a template and create beautiful feature highlight sections."
      backAction={{ content: "Dashboard", onAction: () => navigate("/app") }}
    >
      <BlockStack gap="500">
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />

        <Layout>
          <Layout.Section>
            <Grid>
              {filteredTemplates.map((template) => {
                const requiredLevel = PLAN_LEVELS[template.category.toUpperCase()] || 0;
                const isLocked = currentLevel < requiredLevel;

                return (
                  <Grid.Cell key={template.id} columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
                    <div
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 'var(--p-border-radius-200)',
                        border: '1px solid var(--p-color-border)',
                        overflow: 'hidden',
                        transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = 'var(--p-shadow-300)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'none';
                      }}
                    >
                      {/* Template Preview Area */}
                      <div
                        style={{
                          height: '200px',
                          width: '100%',
                          ...template.previewStyle,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '20px',
                          boxSizing: 'border-box'
                        }}
                        onClick={() => handlePreview(template)}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '12px' }}>
                          <div style={{ color: template.previewStyle.color || '#000', fontSize: '12px', fontWeight: 'bold' }}>
                            {template.title}
                          </div>
                          <InlineStack gap="100" align="center" wrap={false}>
                            {template.features.map((feature, i) => (
                              <div key={i} style={{
                                width: template.features.length === 4 ? '55px' : '75px',
                                padding: '8px 4px',
                                backgroundColor: template.cardStyle?.background || 'white',
                                borderRadius: '4px',
                                border: template.cardStyle?.border || 'none',
                                boxShadow: template.cardStyle ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                gap: '6px'
                              }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: feature.iconColor }}></div>
                                <div style={{ fontSize: '7px', fontWeight: 'bold', lineHeight: '1.2', color: template.cardStyle?.color || '#202223' }}>
                                  {feature.title}
                                </div>
                                <div style={{ fontSize: '5.5px', color: template.cardStyle?.color ? 'rgba(255,255,255,0.7)' : '#6d7175', lineHeight: '1.2' }}>
                                  {feature.subtitle}
                                </div>
                              </div>
                            ))}
                          </InlineStack>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div style={{ padding: 'var(--p-space-400)', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                        <BlockStack gap="400">
                          <InlineStack align="space-between" blockAlign="center">
                            <BlockStack gap="100">
                              <Text variant="headingMd" as="h3">{template.name}</Text>
                              <Text variant="bodySm" tone="subdued">
                                {template.plan} • <span style={{ color: template.price === '$0' ? 'var(--p-color-text-success)' : '#5c6ac4' }}>{template.price}</span>
                              </Text>
                            </BlockStack>
                            {isLocked && (
                              <div style={{ color: '#5c6ac4' }}>
                                <Icon source={LockIcon} tone="base" />
                              </div>
                            )}
                          </InlineStack>

                          <div style={{ marginTop: 'auto' }}>
                            <InlineStack gap="200" align="center">
                              <div style={{ flex: 1 }}>
                                <Button fullWidth onClick={() => handlePreview(template)}>
                                  Preview
                                </Button>
                              </div>
                              <div style={{ flex: 1 }}>
                                {isLocked ? (
                                  <div style={{
                                    '--pc-button-background': '#5c6ac4',
                                    '--pc-button-color': 'white',
                                    '--pc-button-hover-background': '#47539e',
                                    width: '100%'
                                  }}>
                                    <Button
                                      fullWidth
                                      variant="primary"
                                      onClick={() => navigate("/app/billing")}
                                    >
                                      Upgrade
                                    </Button>
                                  </div>
                                ) : (
                                  <div style={{
                                    '--pc-button-background': '#5c6ac4',
                                    '--pc-button-color': 'white',
                                    '--pc-button-hover-background': '#47539e',
                                    width: '100%'
                                  }}>
                                    <Button
                                      fullWidth
                                      variant="primary"
                                      onClick={() => navigate(`/app/create/${template.id}`)}
                                    >
                                      Use Template
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </InlineStack>
                          </div>
                        </BlockStack>
                      </div>
                    </div>
                  </Grid.Cell>
                );
              })}
            </Grid>
          </Layout.Section>
        </Layout>
      </BlockStack>

      {/* Preview Modal */}
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={activeTemplate?.name || "Preview"}
        primaryAction={{
          content: (activeTemplate && currentLevel < (PLAN_LEVELS[activeTemplate.category.toUpperCase()] || 0)) ? 'Upgrade' : 'Use Template',
          onAction: () => {
            if (activeTemplate) {
              const reqLevel = PLAN_LEVELS[activeTemplate.category.toUpperCase()] || 0;
              if (currentLevel < reqLevel) {
                navigate("/app/billing");
              } else {
                navigate(`/app/create/${activeTemplate.id}`);
              }
            }
          },
        }}
        secondaryActions={[
          {
            content: 'Close',
            onAction: () => setPreviewOpen(false),
          },
        ]}
      >
        <Modal.Section>
          {activeTemplate && (
            <div
              style={{
                height: '400px',
                width: '100%',
                ...activeTemplate.previewStyle,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '24px' }}>
                <div style={{ color: activeTemplate.previewStyle.color || '#000', fontSize: '24px', fontWeight: 'bold' }}>
                  {activeTemplate.title}
                </div>
                <InlineStack gap="300" align="center" wrap={false}>
                  {activeTemplate.features.map((feature, i) => (
                    <div key={i} style={{
                      width: activeTemplate.features.length === 4 ? '110px' : '150px',
                      padding: '16px 8px',
                      backgroundColor: activeTemplate.cardStyle?.background || 'white',
                      borderRadius: '8px',
                      border: activeTemplate.cardStyle?.border || 'none',
                      boxShadow: activeTemplate.cardStyle ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '12px'
                    }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: feature.iconColor }}></div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: '1.2', color: activeTemplate.cardStyle?.color || '#202223' }}>
                        {feature.title}
                      </div>
                      <div style={{ fontSize: '11px', color: activeTemplate.cardStyle?.color ? 'rgba(255,255,255,0.7)' : '#6d7175', lineHeight: '1.2' }}>
                        {feature.subtitle}
                      </div>
                    </div>
                  ))}
                </InlineStack>
              </div>
            </div>
          )}
        </Modal.Section>
      </Modal>
    </Page>
  );
}
