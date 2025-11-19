"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Calendar,
  HardDrive,
} from "lucide-react";

interface Backup {
  name: string;
  date: string;
  size: number;
}

interface BackupManagementProps {
  onBackupCreated: () => void;
}

export function BackupManagement({ onBackupCreated }: BackupManagementProps) {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      const response = await fetch("/api/backups");
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch {
      console.error("Failed to fetch backups");
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        await fetchBackups();
        alert("Backup created successfully!");
      }
    } catch {
      alert("Failed to create backup");
    } finally {
      setLoading(false);
    }
  };

  const handleImportBackup = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/backups", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await fetchBackups();
        alert("Backup imported successfully!");
        onBackupCreated();
      } else {
        alert("Failed to import backup");
      }
    } catch {
      alert("Failed to import backup");
    } finally {
      setIsImporting(false);
      event.target.value = "";
    }
  };

  const handleRestoreBackup = async (backupName: string) => {
    if (
      !confirm("This will overwrite current posts with the backup. Continue?")
    )
      return;

    try {
      const response = await fetch(`/api/backups/${backupName}`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Backup restored successfully!");
        onBackupCreated();
      }
    } catch {
      alert("Failed to restore backup");
    }
  };

  const handleDeleteBackup = async (backupName: string) => {
    if (!confirm("Are you sure you want to delete this backup?")) return;

    try {
      const response = await fetch(`/api/backups/${backupName}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBackups(backups.filter((b) => b.name !== backupName));
      }
    } catch {
      alert("Failed to delete backup");
    }
  };

  const handleDownloadBackup = async (backupName: string) => {
    try {
      const response = await fetch(`/api/backups/download/${backupName}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = backupName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert("Failed to download backup");
      }
    } catch {
      alert("Failed to download backup");
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Backup & Restore</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Create Backup
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Save your current posts to a backup file
          </p>
          <Button
            onClick={handleCreateBackup}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </>
            )}
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Backup
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Restore from a previously saved backup file
          </p>
          <label className="w-full">
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={isImporting}
              className="hidden"
            />
            <Button
              asChild
              disabled={isImporting}
              className="w-full cursor-pointer"
            >
              <span>
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose File
                  </>
                )}
              </span>
            </Button>
          </label>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Backup History</h3>
        {backups.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No backups yet. Create one to get started.
          </Card>
        ) : (
          <div className="space-y-2">
            {backups.map((backup) => (
              <Card key={backup.name} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{backup.name}</h4>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(backup.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-4 h-4" />
                        {formatSize(backup.size)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadBackup(backup.name)}
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreBackup(backup.name)}
                      title="Restore"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBackup(backup.name)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
