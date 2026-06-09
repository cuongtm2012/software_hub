-- Persist SePay pending deposits/orders across server restarts
CREATE TABLE IF NOT EXISTS pending_checkouts (
  invoice_number TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pending_checkouts_status_expires
  ON pending_checkouts (status, expires_at);
