import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, RefreshCw } from "lucide-react";

type QueueName = string;

interface QueueCounters {
  pending: number;
  failed: number;
  delayed: number;
}

interface QueueStatsResponse {
  queues: QueueName[];
  stats: Record<string, QueueCounters>;
}

export default function AdminQueuesPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [retryLimits, setRetryLimits] = useState<Record<string, string>>({});
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showFailedOnly, setShowFailedOnly] = useState(false);
  const [queueToClear, setQueueToClear] = useState<string | null>(null);

  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  const { data, isLoading, refetch, isRefetching } = useQuery<QueueStatsResponse>({
    queryKey: ["/api/admin/queue/stats"],
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const queues = useMemo(() => {
    const allQueues = data?.queues || [];
    if (!showFailedOnly) return allQueues;
    return allQueues.filter((queueName) => (data?.stats?.[queueName]?.failed || 0) > 0);
  }, [data, showFailedOnly]);

  const retryFailedMutation = useMutation({
    mutationFn: async ({ queueName, limit }: { queueName: string; limit: number }) => {
      const response = await apiRequest("POST", `/api/admin/queue/${encodeURIComponent(queueName)}/retry-failed`, { limit });
      return response.json();
    },
    onSuccess: (result: any, variables) => {
      toast({
        title: "Retry queued",
        description: result?.message || `Retried failed jobs for ${variables.queueName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/queue/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Retry failed",
        description: error?.message || "Could not retry failed jobs",
        variant: "destructive",
      });
    },
  });

  const clearFailedMutation = useMutation({
    mutationFn: async (queueName: string) => {
      const response = await apiRequest("DELETE", `/api/admin/queue/${encodeURIComponent(queueName)}/failed`);
      return response.json();
    },
    onSuccess: (result: any, queueName) => {
      toast({
        title: "Failed queue cleared",
        description: result?.message || `Cleared failed jobs for ${queueName}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/queue/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Clear failed",
        description: error?.message || "Could not clear failed jobs",
        variant: "destructive",
      });
    },
  });

  const getRetryLimit = (queueName: string) => {
    const raw = retryLimits[queueName];
    const parsed = Number(raw);
    if (!raw || Number.isNaN(parsed) || parsed <= 0) return 50;
    return parsed;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Queue Management</h1>
            <p className="text-muted-foreground">
              Monitor pending, delayed, failed jobs and manually recover failed queues.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={() => refetch()} disabled={isRefetching}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-white p-4 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <label htmlFor="auto-refresh" className="text-sm font-medium">
              Auto refresh (10s)
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="failed-only" checked={showFailedOnly} onCheckedChange={setShowFailedOnly} />
            <label htmlFor="failed-only" className="text-sm font-medium">
              Show failed queues only
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : queues.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>{showFailedOnly ? "No Failed Queues" : "No Queues Registered"}</CardTitle>
              <CardDescription>
                {showFailedOnly
                  ? "All queues are healthy right now. Turn off filter to see all queues."
                  : "Start monolith server and ensure queue processors are initialized."}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4">
            {queues.map((queueName) => {
              const counters = data?.stats?.[queueName] || { pending: 0, failed: 0, delayed: 0 };
              const limitValue = retryLimits[queueName] ?? "";
              const isBusy = retryFailedMutation.isPending || clearFailedMutation.isPending;

              return (
                <Card key={queueName}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{queueName}</CardTitle>
                    <CardDescription>Queue runtime counters and recovery actions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Pending: {counters.pending}</Badge>
                      <Badge variant="outline">Delayed: {counters.delayed}</Badge>
                      <Badge variant={counters.failed > 0 ? "destructive" : "secondary"}>
                        Failed: {counters.failed}
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <Input
                        type="number"
                        min={1}
                        placeholder="Retry limit (default 50)"
                        value={limitValue}
                        onChange={(e) =>
                          setRetryLimits((prev) => ({ ...prev, [queueName]: e.target.value }))
                        }
                        className="md:w-64"
                      />
                      <Button
                        variant="outline"
                        disabled={counters.failed === 0 || isBusy}
                        onClick={() =>
                          retryFailedMutation.mutate({
                            queueName,
                            limit: getRetryLimit(queueName),
                          })
                        }
                      >
                        Retry Failed
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={counters.failed === 0 || isBusy}
                        onClick={() => setQueueToClear(queueName)}
                      >
                        Clear Failed
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!queueToClear} onOpenChange={(open) => !open && setQueueToClear(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear failed jobs?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all failed jobs from
                {" "}
                <span className="font-medium">{queueToClear}</span>.
                {" "}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (!queueToClear) return;
                  clearFailedMutation.mutate(queueToClear);
                  setQueueToClear(null);
                }}
              >
                Confirm Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
