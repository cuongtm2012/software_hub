/**
 * Optional GA4 Data API — requires service account with Analytics Viewer on the property.
 * Env: GA4_PROPERTY_ID (numeric), GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY (or FIREBASE_* fallback)
 */

export interface Ga4DailyRow {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
}

export interface Ga4Summary {
  configured: boolean;
  propertyId?: string;
  days?: number;
  totals?: { sessions: number; users: number; pageViews: number };
  timeline?: Ga4DailyRow[];
  error?: string;
}

function getServiceAccountCredentials(): { clientEmail: string; privateKey: string } | null {
  const clientEmail =
    process.env.GA4_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL || "";
  let privateKey =
    process.env.GA4_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || "";
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }
  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey };
}

export function isGa4ReportingConfigured(): boolean {
  const propertyId = process.env.GA4_PROPERTY_ID;
  return Boolean(propertyId && getServiceAccountCredentials());
}

export async function fetchGa4TrafficSummary(days = 30): Promise<Ga4Summary> {
  const propertyId = process.env.GA4_PROPERTY_ID;
  const creds = getServiceAccountCredentials();

  if (!propertyId || !creds) {
    return {
      configured: false,
      error:
        "Thiếu GA4_PROPERTY_ID và GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY (service account Analytics Viewer).",
    };
  }

  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: creds.clientEmail,
        private_key: creds.privateKey,
      },
    });

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const timeline: Ga4DailyRow[] = (response.rows || []).map((row) => {
      const rawDate = row.dimensionValues?.[0]?.value || "";
      const formatted =
        rawDate.length === 8
          ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
          : rawDate;
      return {
        date: formatted,
        sessions: Number(row.metricValues?.[0]?.value || 0),
        users: Number(row.metricValues?.[1]?.value || 0),
        pageViews: Number(row.metricValues?.[2]?.value || 0),
      };
    });

    const totals = timeline.reduce(
      (acc, row) => ({
        sessions: acc.sessions + row.sessions,
        users: acc.users + row.users,
        pageViews: acc.pageViews + row.pageViews,
      }),
      { sessions: 0, users: 0, pageViews: 0 },
    );

    return {
      configured: true,
      propertyId,
      days,
      totals,
      timeline,
    };
  } catch (err) {
    console.error("GA4 reporting error:", err);
    return {
      configured: true,
      propertyId,
      error: err instanceof Error ? err.message : "GA4 API error",
    };
  }
}
