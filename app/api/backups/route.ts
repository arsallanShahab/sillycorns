import { NextRequest, NextResponse } from "next/server";
import {
  createBackup,
  getBackups,
  importBackup,
  saveBackupFile,
} from "@/lib/storage";

export async function GET() {
  try {
    const backups = await getBackups();
    return NextResponse.json(backups);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch backups" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      // Create backup
      const backupName = await createBackup();
      return NextResponse.json({ backupName }, { status: 201 });
    } else if (contentType?.includes("multipart/form-data")) {
      // Import backup
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided" },
          { status: 400 }
        );
      }

      const buffer = await file.arrayBuffer();
      const content = new TextDecoder().decode(buffer);

      // Validate JSON
      try {
        JSON.parse(content);
      } catch {
        return NextResponse.json(
          { error: "Invalid JSON file" },
          { status: 400 }
        );
      }

      // Save backup file and import it
      const backupName = await saveBackupFile(content);
      const success = await importBackup(backupName);

      if (!success) {
        return NextResponse.json(
          { error: "Failed to import backup" },
          { status: 500 }
        );
      }

      return NextResponse.json({ backupName }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Invalid content type" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process backup" },
      { status: 500 }
    );
  }
}
