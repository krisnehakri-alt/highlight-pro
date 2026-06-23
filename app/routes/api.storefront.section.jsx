import prisma from "../db.server";

/**
 * Public storefront API endpoint.
 * Returns the latest PUBLISHED section for a given shop.
 * No authentication required — this serves public storefront data only.
 * 
 * Usage: GET /api/storefront/section?shop=mystore.myshopify.com
 */
export const loader = async ({ request }) => {
  // CORS headers for cross-origin storefront requests
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return Response.json(
        { error: "Missing shop parameter" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Find the user for this shop
    const user = await prisma.user.findUnique({ where: { shop } });

    if (!user) {
      return Response.json(
        { error: "Shop not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Get the latest published section with features
    const section = await prisma.section.findFirst({
      where: { userId: user.id, status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      include: { features: { orderBy: { order: "asc" } } },
    });

    if (!section) {
      return Response.json(
        { error: "No published section found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Apply template-specific feature limits
    if (section.templateId === 1) {
      section.features = section.features.slice(0, 2);
    } else if (section.templateId === 3) {
      section.features = section.features.slice(0, 3);
    } else if ([4, 5, 6, 7].includes(section.templateId)) {
      section.features = section.features.slice(0, 4);
    }

    return Response.json({ section }, { headers: corsHeaders });
  } catch (error) {
    console.error("Storefront section API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
};
