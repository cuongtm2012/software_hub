-- FCM Tokens Table for Push Notifications
-- This table stores Firebase Cloud Messaging tokens for each user's devices

CREATE TABLE IF NOT EXISTS fcm_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  device_type VARCHAR(20) DEFAULT 'web',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_user_id ON fcm_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_fcm_tokens_token ON fcm_tokens(token);

-- Comments for documentation
COMMENT ON TABLE fcm_tokens IS 'Stores Firebase Cloud Messaging tokens for push notifications';
COMMENT ON COLUMN fcm_tokens.user_id IS 'Reference to the user who owns this device token';
COMMENT ON COLUMN fcm_tokens.token IS 'FCM device token for sending push notifications';
COMMENT ON COLUMN fcm_tokens.device_type IS 'Type of device (web, ios, android)';
COMMENT ON COLUMN fcm_tokens.last_used_at IS 'Last time this token was used to send a notification';
