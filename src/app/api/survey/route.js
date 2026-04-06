export async function POST() {
  return Response.json(
    {
      error: "This legacy endpoint is no longer used. Submit assessments through /api/save-result.",
    },
    { status: 410 }
  );
}
