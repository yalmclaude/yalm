import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { confirmTransfer } from "@/lib/transfer";

// YALM saw the transfer on its bank account: confirm the booking and send the order emails.
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const errors = await confirmTransfer(id);
    return NextResponse.json({ ok: true, emailErrors: errors });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
