"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { PostsManagement } from "@/components/PostsManagement";
import { BackupManagement } from "@/components/BackupManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  HardDrive,
  Activity,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const { logout, isAuthenticated, isLoading } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch("/api/posts/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch {
      console.error("Failed to load stats");
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handlePostsChange = () => {
    loadStats();
  };

  const handleLogout = () => {
    logout();
    router.push("/dashboard/login");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Posts
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Published
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.active}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Drafts
                  </p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.inactive}
                  </p>
                </div>
                <EyeOff className="w-8 h-8 text-gray-400" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="backups" className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Backup & Restore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            <PostsManagement
              initialPosts={[]}
              onPostsChange={handlePostsChange}
            />
          </TabsContent>

          <TabsContent value="backups" className="space-y-6">
            <BackupManagement onBackupCreated={handlePostsChange} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
