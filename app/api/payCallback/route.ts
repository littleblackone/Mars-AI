export async function POST(req: Request) {
  const payload = await req.json();
  const body = JSON.stringify(payload);
  console.log(body);

  return new Response("SUCCESS", { status: 200 });
}
