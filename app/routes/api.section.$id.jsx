import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request, params }) => {
  // Authenticate app proxy request
  const { session } = await authenticate.public.appProxy(request);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sectionId = params.id;
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: { features: { orderBy: { order: 'asc' } } }
  });

  if (!section) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ section });
};
