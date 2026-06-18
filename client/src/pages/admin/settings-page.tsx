import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/AdminLayout";
import { apiRequestJson, parseApiErrorMessage, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings, Sparkles, CheckCircle2, XCircle } from "lucide-react";

type DeepseekSettings = {
  configured: boolean;
  source: "database" | "env" | "none";
  apiKeyMasked: string | null;
  baseUrl: string;
  model: string;
  hasDatabaseKey: boolean;
  hasEnvKey: boolean;
};

const SOURCE_LABEL: Record<DeepseekSettings["source"], string> = {
  database: "Database (Admin)",
  env: "File .env",
  none: "Chưa cấu hình",
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com");
  const [model, setModel] = useState("deepseek-chat");

  const { data, isLoading, refetch, error: loadError } = useQuery<DeepseekSettings>({
    queryKey: ["/api/admin/settings/deepseek"],
    queryFn: () => apiRequestJson<DeepseekSettings>("GET", "/api/admin/settings/deepseek"),
    retry: false,
  });

  useEffect(() => {
    if (!data) return;
    setBaseUrl(data.baseUrl || "https://api.deepseek.com");
    setModel(data.model || "deepseek-chat");
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequestJson<DeepseekSettings>("PUT", "/api/admin/settings/deepseek", {
        baseUrl,
        model,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      }),
    onSuccess: () => {
      setApiKey("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/deepseek"] });
      toast({ title: "Đã lưu cài đặt DeepSeek" });
      refetch();
    },
    onError: (e: unknown) => {
      toast({
        title: "Lỗi lưu cài đặt",
        description: parseApiErrorMessage(e),
        variant: "destructive",
      });
    },
  });

  const clearKeyMutation = useMutation({
    mutationFn: () =>
      apiRequestJson<DeepseekSettings>("PUT", "/api/admin/settings/deepseek", { clearApiKey: true }),
    onSuccess: () => {
      setApiKey("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/deepseek"] });
      toast({ title: "Đã xóa API key trong database" });
      refetch();
    },
    onError: (e: unknown) => {
      toast({ title: "Lỗi", description: parseApiErrorMessage(e), variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: () =>
      apiRequestJson<{ ok?: boolean; reply?: string }>(
        "POST",
        "/api/admin/settings/deepseek/test",
      ),
    onSuccess: (result: { ok?: boolean; reply?: string }) => {
      toast({
        title: "Kết nối DeepSeek OK",
        description: result.reply ? `Phản hồi: ${result.reply}` : undefined,
      });
    },
    onError: (e: unknown) => {
      toast({
        title: "Test DeepSeek thất bại",
        description: parseApiErrorMessage(e),
        variant: "destructive",
      });
    },
  });

  return (
    <AdminLayout>
      <div className="w-full min-w-0 max-w-full px-[4%] py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#004080]" />
            Cài đặt hệ thống
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý API key và cấu hình tích hợp cho admin
          </p>
        </div>

        <Card className="max-w-2xl border-[#004080]/15">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#004080]">
                  <Sparkles className="h-5 w-5 text-[#ffcc00]" />
                  DeepSeek AI
                </CardTitle>
                <CardDescription className="mt-1">
                  Dùng cho tính năng <strong>Sửa bằng AI</strong> trong Blog admin. Key lưu trong database
                  ưu tiên hơn biến môi trường <code className="text-xs">DEEPSEEK_API_KEY</code>.
                </CardDescription>
              </div>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : data?.configured ? (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Đã cấu hình
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Chưa cấu hình
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {loadError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {parseApiErrorMessage(loadError)}
              </div>
            )}

            {data && (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Nguồn đang dùng:</span>{" "}
                  <strong>{SOURCE_LABEL[data.source]}</strong>
                </p>
                {data.apiKeyMasked && (
                  <p>
                    <span className="text-muted-foreground">API key:</span>{" "}
                    <code className="text-xs">{data.apiKeyMasked}</code>
                  </p>
                )}
                {data.hasEnvKey && data.source !== "env" && (
                  <p className="text-xs text-muted-foreground">
                    Có fallback từ .env nếu xóa key trong database.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="deepseek-api-key">API Key</Label>
              <Input
                id="deepseek-api-key"
                type="password"
                autoComplete="off"
                placeholder={data?.apiKeyMasked ? "Để trống nếu không đổi key" : "sk-..."}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Lấy key tại{" "}
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#004080] underline"
                >
                  platform.deepseek.com
                </a>
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="deepseek-base-url">Base URL</Label>
                <Input
                  id="deepseek-base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.deepseek.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deepseek-model">Model</Label>
                <Input
                  id="deepseek-model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="deepseek-chat"
                />
              </div>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-[#004080] hover:bg-[#003366]"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu cài đặt
              </Button>
              <Button
                variant="outline"
                disabled={testMutation.isPending || !data?.configured}
                onClick={() => testMutation.mutate()}
              >
                {testMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Test kết nối
              </Button>
              {data?.hasDatabaseKey && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={clearKeyMutation.isPending}
                  onClick={() => clearKeyMutation.mutate()}
                >
                  Xóa key (DB)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
