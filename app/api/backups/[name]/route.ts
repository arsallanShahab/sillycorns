import { NextRequest, NextResponse } from "next/server";
import { deleteBackup, importBackup } from "@/lib/storage";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const success = await deleteBackup(name);

    if (!success) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete backup" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const success = await importBackup(name);

    if (!success) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to import backup" },
      { status: 500 }
    );
  }
}
