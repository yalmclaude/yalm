import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const html = await readFile(
    path.join(process.cwd(), "site-html/coffret-generator.html"),
    "utf-8"
  );
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
