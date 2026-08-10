import { NextResponse } from "next/server";
import { getCurrentModel } from "../../../lib/ai";

export async function GET() {
  return NextResponse.json({ model: getCurrentModel() });
}
