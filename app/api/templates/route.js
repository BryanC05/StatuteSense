import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import { fetchLegalTemplate } from "../../../lib/sanity";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "Contract";
  const template = await fetchLegalTemplate(type);

  if (!template) {
    return NextResponse.json({ error: "No template found or GROQ is not configured." }, { status: 404 });
  }

  return NextResponse.json({ template });
}
