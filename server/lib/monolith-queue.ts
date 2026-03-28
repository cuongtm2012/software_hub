import { addJob, queueManager, registerProcessor, type QueueJob } from "./queue.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../email.js";
import { sendPushNotificationToMultiple } from "./firebase-admin.js";
import { storage } from "../storage.js";

type VerificationEmailPayload = {
  email: string;
  verificationUrl: string;
};

type PasswordResetEmailPayload = {
  email: string;
  name: string;
  resetUrl: string;
};

type PushNotificationPayload = {
  userId: number;
  title: string;
  body: string;
  data?: Record<string, string>;
};

const QUEUES = {
  EMAIL_VERIFICATION: "email:verification",
  EMAIL_PASSWORD_RESET: "email:password-reset",
  PUSH_NOTIFICATION: "push:notification",
} as const;

let initialized = false;

export async function initializeMonolithQueue() {
  if (initialized) return;

  registerProcessor(
    QUEUES.EMAIL_VERIFICATION,
    async (job: QueueJob<VerificationEmailPayload>) => {
      const payload = job.data;
      const result = await sendVerificationEmail(payload.email, payload.verificationUrl);
      if (!result.success) {
        throw new Error(result.error || "Failed to send verification email");
      }
    },
  );

  registerProcessor(
    QUEUES.EMAIL_PASSWORD_RESET,
    async (job: QueueJob<PasswordResetEmailPayload>) => {
      const payload = job.data;
      const result = await sendPasswordResetEmail(payload.email, payload.name, payload.resetUrl);
      if (!result.success) {
        throw new Error(result.error || "Failed to send password reset email");
      }
    },
  );

  registerProcessor(
    QUEUES.PUSH_NOTIFICATION,
    async (job: QueueJob<PushNotificationPayload>) => {
      const payload = job.data;
      const tokens = await storage.getUserFCMTokens(payload.userId);
      if (!tokens.length) return;

      const result = await sendPushNotificationToMultiple(
        tokens,
        { title: payload.title, body: payload.body },
        payload.data || {},
      );

      if (result.invalidTokens.length > 0) {
        await storage.cleanupInvalidTokens(result.invalidTokens);
      }
    },
  );

  await queueManager.initialize();
  await queueManager.startProcessing();

  // Periodic failed-queue cleanup safety valve.
  setInterval(async () => {
    try {
      for (const queueName of queueManager.getRegisteredQueues()) {
        const stats = await queueManager.getStats(queueName);
        if (stats.failed > 1000) {
          const removed = await queueManager.clearFailedJobs(queueName);
          console.warn(`🧹 Queue ${queueName}: cleared ${removed} failed jobs (threshold exceeded)`);
        }
      }
    } catch (error) {
      console.error("Queue maintenance error:", error);
    }
  }, 30 * 60 * 1000);

  initialized = true;
  console.log("✅ Monolith queue initialized");
}

export async function enqueueVerificationEmailJob(payload: VerificationEmailPayload) {
  return addJob(QUEUES.EMAIL_VERIFICATION, payload);
}

export async function enqueuePasswordResetEmailJob(payload: PasswordResetEmailPayload) {
  return addJob(QUEUES.EMAIL_PASSWORD_RESET, payload);
}

export async function enqueuePushNotificationJob(payload: PushNotificationPayload) {
  return addJob(QUEUES.PUSH_NOTIFICATION, payload);
}
