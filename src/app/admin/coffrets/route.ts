import { readFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const html = await readFile(
    path.join(process.cwd(), "site-html/coffret-generator.html"),
    "utf-8"
  );
  const withAdminFlag = html.replace(
    "<body>",
    "<body>\n<script>window.__COFFRET_ADMIN__ = true;</script>"
  );

  return new NextResponse(withAdminFlag, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
