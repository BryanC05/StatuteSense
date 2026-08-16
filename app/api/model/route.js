import { NextResponse } from "next/server";
import { getCurrentModel } from "../../../lib/ai";
import { checkRateLimit } from "../../../lib/rateLimit";

export async function GET(request) {
  const limited = checkRateLimit(request);
  if (limited) return limited;
  return NextResponse.json({ model: getCurrentModel() });
}
