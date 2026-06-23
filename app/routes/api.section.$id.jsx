import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }) => {
  console.log("App proxy hit for params:", params);
  
  // Authenticate app proxy request
  let authResult;
  try {
    authResult = await authenticate.public.appProxy(request);
    console.log("Auth result:", JSON.stringify(authResult));
  } catch (err) {
    console.error("App Proxy Auth Error:", err);
    return Response.json({ error: "Auth Exception", details: err.message }, { status: 500 });
  }

  const url = new URL(request.url);
  const shop = session?.shop || url.searchParams.get("shop");

  if (!shop) {
    console.log("No shop found in app proxy request or URL.");
    return Response.json({ error: "Unauthorized: Missing Shop" }, { status: 401 });
  }

  const sectionId = params.id;
  let section = null;

  if (sectionId === 'latest') {
    const user = await prisma.user.findUnique({ where: { shop: shop } });
    if (user) {
      section = await prisma.section.findFirst({
        where: { userId: user.id, status: 'PUBLISHED' },
        orderBy: { updatedAt: 'desc' },
        include: { features: { orderBy: { order: 'asc' } } }
      });
      console.log("Found latest section:", section?.id);
    } else {
      console.log("No user found for shop:", session.shop);
    }
  } else {
    section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: { features: { orderBy: { order: 'asc' } } }
    });
  }

  if (!section) {
    console.log("Section not found.");
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (section.templateId === 1) {
    section.features = section.features.slice(0, 2);
  }

  if (section.templateId === 3) {
    section.features = section.features.slice(0, 3);
  }

    if (section.templateId === 4 || section.templateId === 5 || section.templateId === 6 || section.templateId === 7) {
      section.features = section.features.slice(0, 4);
    }

  if (section.templateId === 3) {
    section.features = section.features.slice(0, 3);
  }

  return Response.json({ section });
};
