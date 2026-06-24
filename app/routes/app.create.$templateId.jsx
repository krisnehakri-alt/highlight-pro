import { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  TextField,
  Button,
  InlineStack,
  Box,
  Divider,
  ColorPicker,
  hsbToHex,
  hexToRgb,
  rgbToHsb,
  Banner
} from "@shopify/polaris";
import { useLoaderData, useSubmit, useNavigate, useActionData, redirect } from "react-router";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const sectionId = url.searchParams.get("id");

  let section = null;
  if (sectionId) {
    section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { features: { orderBy: { order: 'asc' } } }
    });
  }

  return { templateId: parseInt(params.templateId), section };
};

export const action = async ({ request, params }) => {
  try {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const payload = JSON.parse(formData.get("payload"));
    
    let user = await prisma.user.findUnique({ where: { shop: session.shop } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          shop: session.shop
        }
      });
    }

    let section;
    if (payload.id) {
      // Update existing
      section = await prisma.section.update({
        where: { id: payload.id },
        data: {
          title: payload.title || "Section Title",
          subtitle: payload.subtitle || "",
          settings: JSON.stringify(payload.settings || {}),
          status: payload.status,
        }
      });

      // Handle features: Delete old, insert new for simplicity
      await prisma.feature.deleteMany({ where: { sectionId: section.id } });
      for (let i = 0; i < payload.features.length; i++) {
        const f = payload.features[i];
        await prisma.feature.create({
          data: {
            sectionId: section.id,
            icon: f.icon || "",
            title: f.title || "",
            description: f.description || "",
            order: i
          }
        });
      }

    } else {
      // Create new
      section = await prisma.section.create({
        data: {
          userId: user.id,
          templateId: parseInt(params.templateId),
          title: payload.title || "Section Title",
          subtitle: payload.subtitle || "",
          settings: JSON.stringify(payload.settings || {}),
          status: payload.status,
          features: {
            create: payload.features.map((f, i) => ({
              icon: f.icon || "",
              title: f.title || "",
              description: f.description || "",
              order: i
            }))
          }
        }
      });
    }

    if (payload.status === "PUBLISHED") {
      return redirect("/app/templates");
    }

    return { success: true, sectionId: section.id, status: payload.status };
  } catch (error) {
    console.error("Action error:", error);
    return { success: false, error: error.message || "An unexpected error occurred while saving." };
  }
};

export default function CreateSection() {
  const { templateId, section } = useLoaderData();
  const submit = useSubmit();
  const navigate = useNavigate();
  const actionData = useActionData();

  const isFreeTemplate = templateId === 1;
  const isFirstStarterTemplate = templateId === 2;
  const isSecondStarterTemplate = templateId === 3;
  const isFirstProTemplate = templateId === 4;
  const isSecondProTemplate = templateId === 5;
  const isFirstPremiumTemplate = templateId === 6;
  const isSecondPremiumTemplate = templateId === 7;

  const [currentSectionId, setCurrentSectionId] = useState(section?.id || null);
  const [title, setTitle] = useState(section?.title || "Why Choose Us");
  const [subtitle, setSubtitle] = useState(section?.subtitle || "We provide the best service in the industry");
  const [settings, setSettings] = useState(section?.settings ? JSON.parse(section.settings) : {
    bgColor: "#ffffff",
    textColor: "#000000",
    iconColor: "#5c6ac4",
    padding: "40px",
    borderRadius: "8px"
  });

  const defaultFeatures = isFreeTemplate 
    ? [
        { icon: "🚚", title: "Fast Delivery", description: "Delivery within 24 hours" },
        { icon: "🔒", title: "Secure Checkout", description: "100% safe payment" }
      ]
    : (isFirstProTemplate || isSecondProTemplate)
    ? [
        { icon: "🚚", title: "Fast Delivery", description: "Delivery within 24 hours" },
        { icon: "📦", title: "Easy Returns", description: "30 days return policy" },
        { icon: "🔒", title: "Secure Payment", description: "100% safe payment" },
        { icon: "🕒", title: "24/7 Support", description: "Always available" }
      ]
    : isFirstPremiumTemplate
    ? [
        { icon: "🚚", title: "Free Shipping", description: "Free shipping on all orders" },
        { icon: "🔁", title: "Easy Exchanges", description: "Hassle free exchanges" },
        { icon: "🚀", title: "Fast Delivery", description: "Delivery within 24 hours" },
        { icon: "🛡️", title: "24/7 Support", description: "We are always available" }
      ]
    : isSecondPremiumTemplate
    ? [
        { icon: "🏢", title: "Enterprise Grade", description: "Built for scale & performance" },
        { icon: "🔐", title: "Top Security", description: "Bank-level security" },
        { icon: "⭐", title: "Premium Quality", description: "Premium quality" },
        { icon: "⚡", title: "Reliable Uptime", description: "99.9% uptime guarantee" }
      ]
    : [
        { icon: "🚚", title: "Fast Delivery", description: "Delivery within 24 hours" },
        { icon: "🔒", title: "Secure Checkout", description: "100% safe payment" },
        { icon: "🎧", title: "24/7 Support", description: "Always available" }
      ];

  const [features, setFeatures] = useState(section?.features || defaultFeatures);

  useEffect(() => {
    if (actionData?.success) {
      if (actionData.status !== "PUBLISHED" && actionData.sectionId) {
        setCurrentSectionId(actionData.sectionId);
      }
    }
  }, [actionData]);

  const handleSave = (status) => {
    const payload = {
      id: currentSectionId,
      title,
      subtitle,
      settings,
      features,
      status
    };
    submit({ payload: JSON.stringify(payload) }, { method: "POST" });
  };

  const updateFeature = (index, key, value) => {
    const newFeatures = [...features];
    newFeatures[index][key] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    if (isFreeTemplate && features.length >= 2) return;
    if (isFirstStarterTemplate && features.length >= 3) return;
    if (isSecondStarterTemplate && features.length >= 3) return;
    if ((isFirstProTemplate || isSecondProTemplate) && features.length >= 4) return;
    if ((isFirstPremiumTemplate || isSecondPremiumTemplate) && features.length >= 4) return;
    setFeatures([...features, { icon: "✨", title: "New Feature", description: "Description goes here" }]);
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const moveFeature = (index, direction) => {
    if (index + direction < 0 || index + direction >= features.length) return;
    const newFeatures = [...features];
    const temp = newFeatures[index];
    newFeatures[index] = newFeatures[index + direction];
    newFeatures[index + direction] = temp;
    setFeatures(newFeatures);
  };

  return (
    <Page 
      title={section ? "Edit Section" : "Create Section"} 
      backAction={{ content: "Dashboard", onAction: () => navigate("/app") }}
      primaryAction={{ content: "Publish", onAction: () => handleSave("PUBLISHED") }}
      secondaryActions={[{ content: "Save Draft", onAction: () => handleSave("DRAFT") }]}
    >
      <Layout>
        {actionData?.error && (
          <Layout.Section>
            <Banner tone="critical" title="Error saving section">
              <p>{actionData.error}</p>
            </Banner>
          </Layout.Section>
        )}
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card title="General Info">
              <BlockStack gap="300">
                <TextField label="Section Title" value={title} onChange={setTitle} autoComplete="off" />
                <TextField label="Section Subtitle" value={subtitle} onChange={setSubtitle} autoComplete="off" />
              </BlockStack>
            </Card>

            <Card title="Design Settings">
              <BlockStack gap="300">
                <TextField label="Background Color" value={settings.bgColor} onChange={(v) => setSettings({...settings, bgColor: v})} />
                <TextField label="Text Color" value={settings.textColor} onChange={(v) => setSettings({...settings, textColor: v})} />
                <TextField label="Icon Color" value={settings.iconColor} onChange={(v) => setSettings({...settings, iconColor: v})} />
                <TextField label="Padding" value={settings.padding} onChange={(v) => setSettings({...settings, padding: v})} />
                <TextField label="Border Radius" value={settings.borderRadius} onChange={(v) => setSettings({...settings, borderRadius: v})} />
              </BlockStack>
            </Card>

            <Card title="Features">
              <BlockStack gap="400">
                {features.map((f, i) => (
                  <Box key={i} padding="300" background="bg-surface-secondary" borderRadius="200">
                    <BlockStack gap="200">
                      <InlineStack align="space-between">
                        <Text variant="headingSm" as="h4">Feature {i + 1}</Text>
                        <InlineStack gap="100">
                          <Button size="micro" onClick={() => moveFeature(i, -1)} disabled={i===0}>↑</Button>
                          <Button size="micro" onClick={() => moveFeature(i, 1)} disabled={i===features.length-1}>↓</Button>
                          <Button size="micro" tone="critical" onClick={() => removeFeature(i)}>✕</Button>
                        </InlineStack>
                      </InlineStack>
                      <TextField label="Icon (Emoji/URL)" value={f.icon} onChange={(v) => updateFeature(i, 'icon', v)} />
                      <TextField label="Title" value={f.title} onChange={(v) => updateFeature(i, 'title', v)} />
                      <TextField label="Description" value={f.description} onChange={(v) => updateFeature(i, 'description', v)} />
                    </BlockStack>
                  </Box>
                ))}
                {(!isFreeTemplate || features.length < 2) && (!isFirstStarterTemplate || features.length < 3) && (!isSecondStarterTemplate || features.length < 3) && (!isFirstProTemplate || features.length < 4) && (!isSecondProTemplate || features.length < 4) && (!isFirstPremiumTemplate || features.length < 4) && (!isSecondPremiumTemplate || features.length < 4) && (
                  <Button fullWidth onClick={addFeature}>Add Feature</Button>
                )}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card title="Live Preview">
            <Box 
              padding="500" 
              style={{
                backgroundColor: settings.bgColor,
                color: settings.textColor,
                padding: settings.padding,
                minHeight: '400px',
                borderRadius: '8px',
                border: '1px solid #e1e3e5'
              }}
            >
              <BlockStack gap="400" align="center">
                <Box style={{textAlign: 'center'}}>
                  <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{title}</h2>
                  <p style={{ fontSize: '16px', margin: 0, opacity: 0.8 }}>{subtitle}</p>
                </Box>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  width: '100%',
                  marginTop: '30px'
                }}>
                  {features.map((f, i) => (
                    <div key={i} style={{
                      padding: '20px',
                      backgroundColor: 'rgba(0,0,0,0.03)',
                      borderRadius: settings.borderRadius,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '40px', color: settings.iconColor, marginBottom: '15px' }}>{f.icon}</div>
                      <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 10px 0' }}>{f.title}</h3>
                      <p style={{ fontSize: '14px', margin: 0, opacity: 0.8 }}>{f.description}</p>
                    </div>
                  ))}
                </div>
              </BlockStack>
            </Box>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
