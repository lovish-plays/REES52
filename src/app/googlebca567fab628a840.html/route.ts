export function GET() {
  return new Response("google-site-verification: googlebca567fab628a840.html", {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
