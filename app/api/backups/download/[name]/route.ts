import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const BACKUPS_DIR = path.join(process.cwd(), "data", "backups");
    const backupPath = path.join(BACKUPS_DIR, name);

    // Security: ensure the file is within backups directory
    const realPath = await fs.realpath(backupPath);
    const realBackupsDir = await fs.realpath(BACKUPS_DIR);

    if (!realPath.startsWith(realBackupsDir)) {
      return NextResponse.json(
        { error: "Invalid backup path" },
        { status: 403 }
      );
    }

    // Check if file exists
    await fs.access(backupPath);
    const fileContent = await fs.readFile(backupPath);

    return new NextResponse(fileContent, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Backup file not found" },
      { status: 404 }
    );
  }
}
