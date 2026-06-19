import { json } from "@remix-run/node";

export const loader = async ({ request }) => {
  try {
    // TODO: Replace with actual data fetching logic (e.g., database query)
    const data = {
      message: "Hello from the server!",
      timestamp: new Date().toISOString(),
    };
    return json(data);
  } catch (error) {
    console.error("/api/data error:", error);
    // Return a detailed 500 response
    return new Response(JSON.stringify({ error: "Internal Database Error", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
