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
import { Loader2, Settings, Sparkles, CheckCircle2, XCircle, Search } from "lucide-react";

type DeepseekSettings = {
  configured: boolean;
  source: "database" | "env" | "none";
  apiKeyMasked: string | null;
  baseUrl: string;
  model: string;
  hasDatabaseKey: boolean;
  hasEnvKey: boolean;
};

type GaSettings = {
  configured: boolean;
  source: "database" | "env" | "none";
  measurementIdMasked: string | null;
  hasDatabaseValue: boolean;
  hasEnvValue: boolean;
};

type GscSettings = {
  configured: boolean;
  source: "database" | "env" | "none";
  tokenMasked: string | null;
  hasDatabaseValue: boolean;
  hasEnvValue: boolean;
  sitemapUrl: string;
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
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [gscVerificationToken, setGscVerificationToken] = useState("");

  const { data, isLoading, refetch, error: loadError } = useQuery<DeepseekSettings>({
    queryKey: ["/api/admin/settings/deepseek"],
    queryFn: () => apiRequestJson<DeepseekSettings>("GET", "/api/admin/settings/deepseek"),
    retry: false,
  });

  const {
    data: gaData,
    isLoading: isLoadingGa,
    refetch: refetchGa,
    error: loadGaError,
  } = useQuery<GaSettings>({
    queryKey: ["/api/admin/settings/ga4"],
    queryFn: () => apiRequestJson<GaSettings>("GET", "/api/admin/settings/ga4"),
    retry: false,
  });

  const {
    data: gscData,
    isLoading: isLoadingGsc,
    refetch: refetchGsc,
    error: loadGscError,
  } = useQuery<GscSettings>({
    queryKey: ["/api/admin/settings/gsc"],
    queryFn: () => apiRequestJson<GscSettings>("GET", "/api/admin/settings/gsc"),
    retry: false,
  });

  useEffect(() => {
    if (!data) return;
    setBaseUrl(data.baseUrl || "https://api.deepseek.com");
    setModel(data.model || "deepseek-chat");
  }, [data]);

  useEffect(() => {
    if (!gaData) return;
    setGaMeasurementId("");
  }, [gaData]);

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

  const saveGaMutation = useMutation({
    mutationFn: () =>
      apiRequestJson<GaSettings>("PUT", "/api/admin/settings/ga4", {
        ...(gaMeasurementId.trim() ? { measurementId: gaMeasurementId.trim() } : {}),
      }),
    onSuccess: () => {
      setGaMeasurementId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/ga4"] });
      toast({ title: "Đã lưu cài đặt GA4" });
      refetchGa();
    },
    onError: (e: unknown) => {
      toast({
        title: "Lỗi lưu cài đặt",
        description: parseApiErrorMessage(e),
        variant: "destructive",
      });
    },
  });

  const clearGaMutation = useMutation({
    mutationFn: () => apiRequestJson<GaSettings>("PUT", "/api/admin/settings/ga4", { clearMeasurementId: true }),
    onSuccess: () => {
      setGaMeasurementId("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/ga4"] });
      toast({ title: "Đã xóa GA Measurement ID trong database" });
      refetchGa();
    },
    onError: (e: unknown) => {
      toast({ title: "Lỗi", description: parseApiErrorMessage(e), variant: "destructive" });
    },
  });

  const saveGscMutation = useMutation({
    mutationFn: () =>
      apiRequestJson<GscSettings>("PUT", "/api/admin/settings/gsc", {
        ...(gscVerificationToken.trim() ? { verificationToken: gscVerificationToken.trim() } : {}),
      }),
    onSuccess: () => {
      setGscVerificationToken("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/gsc"] });
      toast({ title: "Đã lưu verification token Search Console" });
      refetchGsc();
    },
    onError: (e: unknown) => {
      toast({
        title: "Lỗi lưu cài đặt",
        description: parseApiErrorMessage(e),
        variant: "destructive",
      });
    },
  });

  const clearGscMutation = useMutation({
    mutationFn: () =>
      apiRequestJson<GscSettings>("PUT", "/api/admin/settings/gsc", { clearVerificationToken: true }),
    onSuccess: () => {
      setGscVerificationToken("");
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/gsc"] });
      toast({ title: "Đã xóa verification token trong database" });
      refetchGsc();
    },
    onError: (e: unknown) => {
      toast({ title: "Lỗi", description: parseApiErrorMessage(e), variant: "destructive" });
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

        <Card className="max-w-2xl border-[#004080]/15">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#004080]">
                  <Settings className="h-5 w-5 text-[#ffcc00]" />
                  Google Analytics (GA4)
                </CardTitle>
                <CardDescription className="mt-1">
                  Cấu hình <code className="text-xs">Measurement ID</code> để bật tracking GA4 (client) cho toàn site.
                  Giá trị lưu trong database sẽ dùng runtime (không cần build lại).
                </CardDescription>
              </div>
              {isLoadingGa ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : gaData?.configured ? (
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
            {loadGaError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {parseApiErrorMessage(loadGaError)}
              </div>
            )}

            {gaData && (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Nguồn đang dùng:</span>{" "}
                  <strong>{gaData.source === "database" ? "Database (Admin)" : gaData.source === "env" ? "Env" : "Chưa cấu hình"}</strong>
                </p>
                {gaData.measurementIdMasked && (
                  <p>
                    <span className="text-muted-foreground">Measurement ID:</span>{" "}
                    <code className="text-xs">{gaData.measurementIdMasked}</code>
                  </p>
                )}
                {gaData.hasEnvValue && gaData.source !== "env" && (
                  <p className="text-xs text-muted-foreground">
                    Có fallback từ env nếu xóa value trong database.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="ga-measurement-id">GA4 Measurement ID</Label>
              <Input
                id="ga-measurement-id"
                placeholder={gaData?.measurementIdMasked ? "Để trống nếu không đổi" : "G-XXXXXXXXXX"}
                value={gaMeasurementId}
                onChange={(e) => setGaMeasurementId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Ví dụ: <code className="text-xs">G-XXXXXXXXXX</code>
              </p>
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-[#004080] hover:bg-[#003366]"
                disabled={saveGaMutation.isPending}
                onClick={() => saveGaMutation.mutate()}
              >
                {saveGaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu cài đặt
              </Button>
              {gaData?.hasDatabaseValue && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={clearGaMutation.isPending}
                  onClick={() => clearGaMutation.mutate()}
                >
                  Xóa value (DB)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="max-w-2xl border-[#004080]/15">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-[#004080]">
                  <Search className="h-5 w-5 text-[#ffcc00]" />
                  Google Search Console
                </CardTitle>
                <CardDescription className="mt-1">
                  Verification token (HTML meta tag) để xác minh sở hữu{" "}
                  <code className="text-xs">swhubco.com</code> trên Search Console. Sau verify, submit sitemap{" "}
                  <code className="text-xs">sitemap.xml</code> trong GSC dashboard.
                </CardDescription>
              </div>
              {isLoadingGsc ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : gscData?.configured ? (
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
            {loadGscError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {parseApiErrorMessage(loadGscError)}
              </div>
            )}

            {gscData && (
              <div className="rounded-lg border bg-muted/30 px-4 py-3 text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Sitemap URL:</span>{" "}
                  <a
                    href={gscData.sitemapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#004080] underline break-all"
                  >
                    {gscData.sitemapUrl}
                  </a>
                </p>
                <p>
                  <span className="text-muted-foreground">Nguồn token:</span>{" "}
                  <strong>
                    {gscData.source === "database"
                      ? "Database (Admin)"
                      : gscData.source === "env"
                        ? "Env"
                        : "Chưa cấu hình"}
                  </strong>
                </p>
                {gscData.tokenMasked && (
                  <p>
                    <span className="text-muted-foreground">Token:</span>{" "}
                    <code className="text-xs">{gscData.tokenMasked}</code>
                  </p>
                )}
              </div>
            )}

            <div className="rounded-lg border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 space-y-2">
              <p className="font-medium">Cách lấy token</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>
                  Vào{" "}
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#004080] underline"
                  >
                    Google Search Console
                  </a>{" "}
                  → Add property → HTML tag
                </li>
                <li>Copy phần <code>content</code> trong thẻ meta (không copy cả thẻ)</li>
                <li>Lưu ở đây → Verify trên GSC → Sitemaps → submit <code>sitemap.xml</code></li>
              </ol>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gsc-verification-token">Verification token</Label>
              <Input
                id="gsc-verification-token"
                type="password"
                autoComplete="off"
                placeholder={gscData?.tokenMasked ? "Để trống nếu không đổi" : "Dán content từ GSC..."}
                value={gscVerificationToken}
                onChange={(e) => setGscVerificationToken(e.target.value)}
              />
            </div>

            <Separator />

            <div className="flex flex-wrap gap-2">
              <Button
                className="bg-[#004080] hover:bg-[#003366]"
                disabled={saveGscMutation.isPending || !gscVerificationToken.trim()}
                onClick={() => saveGscMutation.mutate()}
              >
                {saveGscMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Lưu token
              </Button>
              {gscData?.hasDatabaseValue && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  disabled={clearGscMutation.isPending}
                  onClick={() => clearGscMutation.mutate()}
                >
                  Xóa token (DB)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
