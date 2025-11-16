var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import session from "express-session";

// server/storage.ts
import { eq, desc, and, or, lt, gt, sql as sql2 } from "drizzle-orm";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  deposits: () => deposits,
  insertDepositSchema: () => insertDepositSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertOperatorSchema: () => insertOperatorSchema,
  insertPaymentRequestSchema: () => insertPaymentRequestSchema,
  insertTronScanStateSchema: () => insertTronScanStateSchema,
  insertUserSchema: () => insertUserSchema,
  notifications: () => notifications,
  operators: () => operators,
  paymentRequests: () => paymentRequests,
  tronScanState: () => tronScanState,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username").notNull(),
  availableBalance: numeric("available_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  frozenBalance: numeric("frozen_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  registeredAt: timestamp("registered_at").notNull().defaultNow()
});
var paymentRequests = pgTable("payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amountRub: numeric("amount_rub", { precision: 18, scale: 2 }).notNull(),
  amountUsdt: numeric("amount_usdt", { precision: 18, scale: 8 }).notNull(),
  frozenRate: numeric("frozen_rate", { precision: 18, scale: 2 }).notNull(),
  urgency: text("urgency").notNull(),
  hasUrgentFee: integer("has_urgent_fee").notNull().default(0),
  attachments: jsonb("attachments"),
  comment: text("comment"),
  status: text("status").notNull().default("submitted"),
  receipt: jsonb("receipt"),
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  requestId: varchar("request_id"),
  message: text("message").notNull(),
  isRead: integer("is_read").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  requestedAmount: numeric("requested_amount", { precision: 18, scale: 8 }),
  payableAmount: numeric("payable_amount", { precision: 18, scale: 8 }),
  walletAddress: text("wallet_address"),
  expiresAt: timestamp("expires_at"),
  status: text("status").notNull().default("pending"),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: varchar("confirmed_by")
});
var operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  salt: varchar("salt", { length: 64 }).notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var tronScanState = pgTable("tron_scan_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lastProcessedBlockNumber: text("last_processed_block_number").notNull().default("0"),
  lastProcessedTimestamp: timestamp("last_processed_timestamp").notNull().defaultNow(),
  lastSuccessfulScan: timestamp("last_successful_scan").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  registeredAt: true
});
var insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  createdAt: true
});
var insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true
});
var insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
  confirmedBy: true
});
var insertTronScanStateSchema = createInsertSchema(tronScanState).omit({
  id: true,
  lastProcessedTimestamp: true,
  lastSuccessfulScan: true,
  updatedAt: true
});
var insertOperatorSchema = createInsertSchema(operators).omit({
  id: true,
  createdAt: true
});

// server/db.ts
var { Pool } = pkg;
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
var db = drizzle(pool, { schema: schema_exports });

// server/config/tron.ts
import { TronWeb } from "tronweb";

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (req, res, next) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/config/tron.ts
var USDT_DECIMALS = 6;
var BALANCE_DECIMALS = 8;
function getMasterWalletAddress() {
  const address = process.env.MASTER_WALLET_ADDRESS || "THVyqrSDMBvpibitvTt4xJFWxVgY61acLu";
  if (!isValidTronAddress(address)) {
    throw new Error(`Invalid TRON master wallet address: ${address}`);
  }
  return address;
}
function getUsdtContractAddress() {
  return process.env.USDT_CONTRACT_ADDRESS || "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
}
function getTronGridApiKey() {
  return process.env.TRONGRID_API_KEY;
}
function isValidTronAddress(address) {
  try {
    if (!address || address.length !== 34) {
      return false;
    }
    if (!address.startsWith("T")) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
function initializeTronWeb() {
  const apiKey = getTronGridApiKey();
  const config = {
    fullHost: "https://api.trongrid.io"
  };
  if (apiKey) {
    config.headers = { "TRON-PRO-API-KEY": apiKey };
    log("TronWeb initialized with API key");
  } else {
    log("\u26A0\uFE0F TronWeb initialized without API key - rate limits apply");
  }
  return new TronWeb(config);
}
function convertFromSun(amountInSun) {
  const amountBigInt = BigInt(amountInSun);
  const divisor = BigInt(10 ** USDT_DECIMALS);
  const wholePart = amountBigInt / divisor;
  const fractionalPart = amountBigInt % divisor;
  const amountStr = `${wholePart}.${fractionalPart.toString().padStart(USDT_DECIMALS, "0")}`;
  const amount = parseFloat(amountStr);
  return parseFloat(amount.toFixed(BALANCE_DECIMALS));
}
function formatUsdtBalance(amount) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num.toFixed(BALANCE_DECIMALS);
}

// server/storage.ts
var USDT_SCALE = 1e8;
function decimalStringToBigInt(value) {
  let str;
  if (typeof value === "number") {
    str = value.toLocaleString("en-US", {
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 20
    });
  } else {
    str = value;
  }
  const isNegative = str.startsWith("-");
  const absStr = isNegative ? str.slice(1) : str;
  const [intPart, decPart = ""] = absStr.split(".");
  if (!decPart || decPart.length <= 8) {
    const paddedDec = decPart.padEnd(8, "0");
    const result2 = BigInt(intPart || "0") * BigInt(USDT_SCALE) + BigInt(paddedDec);
    return isNegative ? -result2 : result2;
  }
  const first8Digits = decPart.slice(0, 8);
  const digit9 = parseInt(decPart[8] || "0", 10);
  let fractionalScaled = BigInt(first8Digits);
  let integerPart = BigInt(intPart || "0");
  if (digit9 >= 5) {
    fractionalScaled += BigInt(1);
    if (fractionalScaled >= BigInt(USDT_SCALE)) {
      integerPart += BigInt(1);
      fractionalScaled = BigInt(0);
    }
  }
  const result = integerPart * BigInt(USDT_SCALE) + fractionalScaled;
  return isNegative ? -result : result;
}
function bigIntToDecimal(value) {
  return Number(value) / USDT_SCALE;
}
var PostgresStorage = class {
  // User methods
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  async getUserByTelegramId(telegramId) {
    const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return result[0];
  }
  async createUser(insertUser) {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  async updateUserBalance(userId, availableBalance, frozenBalance) {
    await db.update(users).set({ availableBalance, frozenBalance }).where(eq(users.id, userId));
  }
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.registeredAt));
  }
  // Payment request methods
  async getPaymentRequest(id) {
    const result = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
    return result[0];
  }
  async getPaymentRequestsByUserId(userId) {
    return await db.select().from(paymentRequests).where(eq(paymentRequests.userId, userId)).orderBy(desc(paymentRequests.createdAt));
  }
  async createPaymentRequest(insertRequest) {
    const result = await db.insert(paymentRequests).values(insertRequest).returning();
    return result[0];
  }
  async updatePaymentRequestStatus(id, status) {
    await db.update(paymentRequests).set({ status }).where(eq(paymentRequests.id, id));
  }
  async updatePaymentRequestWithReceipt(id, status, receipt) {
    await db.update(paymentRequests).set({ status, receipt }).where(eq(paymentRequests.id, id));
  }
  async updatePaymentRequestFull(id, updates) {
    await db.update(paymentRequests).set(updates).where(eq(paymentRequests.id, id));
  }
  async getAllPaymentRequests() {
    return await db.select().from(paymentRequests).orderBy(desc(paymentRequests.createdAt));
  }
  // Notification methods
  async getNotificationsByUserId(userId) {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }
  async createNotification(insertNotification) {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }
  async markNotificationAsRead(id) {
    await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, id));
  }
  async getUnreadNotificationsCount(userId) {
    const result = await db.select().from(notifications).where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, 0)
    ));
    return result.length;
  }
  // Deposit methods
  async getDeposit(id) {
    const result = await db.select().from(deposits).where(eq(deposits.id, id)).limit(1);
    return result[0];
  }
  async getDepositsByUserId(userId) {
    return await db.select().from(deposits).where(eq(deposits.userId, userId)).orderBy(desc(deposits.createdAt));
  }
  async getPendingDeposits() {
    return await db.select().from(deposits).where(eq(deposits.status, "pending")).orderBy(desc(deposits.createdAt));
  }
  async createDeposit(insertDeposit) {
    const result = await db.insert(deposits).values(insertDeposit).returning();
    return result[0];
  }
  async confirmDeposit(id, confirmedBy) {
    await db.update(deposits).set({
      status: "confirmed",
      confirmedAt: /* @__PURE__ */ new Date(),
      confirmedBy
    }).where(eq(deposits.id, id));
  }
  async rejectDeposit(id) {
    await db.update(deposits).set({ status: "rejected" }).where(eq(deposits.id, id));
  }
  async getActiveDeposits() {
    const now = /* @__PURE__ */ new Date();
    return await db.select().from(deposits).where(
      and(
        or(
          eq(deposits.status, "pending"),
          eq(deposits.status, "awaiting_payment")
        ),
        or(
          sql2`${deposits.expiresAt} > ${now}`,
          sql2`${deposits.expiresAt} IS NULL`
        )
      )
    ).orderBy(desc(deposits.createdAt));
  }
  async updateDepositStatus(id, status) {
    await db.update(deposits).set({ status }).where(eq(deposits.id, id));
  }
  async expireOldDeposits() {
    const now = /* @__PURE__ */ new Date();
    const result = await db.update(deposits).set({ status: "expired" }).where(
      and(
        or(
          eq(deposits.status, "pending"),
          eq(deposits.status, "awaiting_payment")
        ),
        lt(deposits.expiresAt, now)
      )
    ).returning({ id: deposits.id });
    return result.length;
  }
  async getDepositByTxHash(txHash) {
    const result = await db.select().from(deposits).where(eq(deposits.txHash, txHash)).limit(1);
    return result[0];
  }
  async findPendingDepositByPayableAmount(payableAmount) {
    try {
      console.log("[findPendingDepositByPayableAmount] Starting query for amount:", payableAmount);
      const now = /* @__PURE__ */ new Date();
      const payableAmountStr = formatUsdtBalance(payableAmount);
      const result = await db.select().from(deposits).where(
        and(
          eq(deposits.status, "pending"),
          eq(deposits.payableAmount, payableAmountStr),
          gt(deposits.expiresAt, now)
        )
      ).orderBy(deposits.createdAt).limit(1);
      console.log("[findPendingDepositByPayableAmount] Query successful, result:", result[0] ? "found" : "not found");
      return result[0];
    } catch (error) {
      console.error("[findPendingDepositByPayableAmount] ERROR:", error);
      console.error("[findPendingDepositByPayableAmount] Stack trace:", error instanceof Error ? error.stack : "No stack");
      throw error;
    }
  }
  async confirmDepositWithTransaction(depositId, txHash, actualAmount) {
    try {
      return await db.transaction(async (tx) => {
        const depositResult = await tx.select().from(deposits).where(eq(deposits.id, depositId)).limit(1);
        const deposit = depositResult[0];
        if (!deposit) {
          throw new Error("Deposit not found");
        }
        const userResult = await tx.select().from(users).where(eq(users.id, deposit.userId)).limit(1);
        const user = userResult[0];
        if (!user) {
          throw new Error("User not found");
        }
        await tx.update(deposits).set({
          status: "confirmed",
          txHash,
          confirmedAt: /* @__PURE__ */ new Date(),
          amount: formatUsdtBalance(actualAmount)
        }).where(eq(deposits.id, depositId));
        const currentBalanceScaled = decimalStringToBigInt(user.availableBalance);
        const actualAmountScaled = decimalStringToBigInt(actualAmount);
        const newBalanceScaled = currentBalanceScaled + actualAmountScaled;
        const newBalance = bigIntToDecimal(newBalanceScaled);
        await tx.update(users).set({
          availableBalance: formatUsdtBalance(newBalance)
        }).where(eq(users.id, deposit.userId));
        await tx.insert(notifications).values({
          userId: deposit.userId,
          message: `\u0411\u0430\u043B\u0430\u043D\u0441 \u043F\u043E\u043F\u043E\u043B\u043D\u0435\u043D \u043D\u0430 ${formatUsdtBalance(actualAmount)} USDT. \u0414\u0435\u043F\u043E\u0437\u0438\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D \u0431\u043B\u043E\u043A\u0447\u0435\u0439\u043D\u043E\u043C.`,
          isRead: 0
        });
        return true;
      });
    } catch (error) {
      console.error("Error confirming deposit with transaction:", error);
      return false;
    }
  }
  // TronScan state management
  async getTronScanState() {
    try {
      console.log("[getTronScanState] Starting query...");
      const result = await db.select().from(tronScanState).limit(1);
      console.log("[getTronScanState] Query successful, result:", result[0] ? "found" : "not found");
      return result[0];
    } catch (error) {
      console.error("[getTronScanState] ERROR:", error);
      console.error("[getTronScanState] Stack trace:", error instanceof Error ? error.stack : "No stack");
      throw error;
    }
  }
  async createTronScanState(data) {
    try {
      console.log("[createTronScanState] Starting insert with data:", data);
      const result = await db.insert(tronScanState).values(data).returning();
      console.log("[createTronScanState] Insert successful");
      return result[0];
    } catch (error) {
      console.error("[createTronScanState] ERROR:", error);
      console.error("[createTronScanState] Stack trace:", error instanceof Error ? error.stack : "No stack");
      throw error;
    }
  }
  async updateTronScanState(lastProcessedBlockNumber) {
    try {
      console.log("[updateTronScanState] Starting update for block:", lastProcessedBlockNumber);
      const state = await this.getTronScanState();
      if (state) {
        console.log("[updateTronScanState] Updating existing state, id:", state.id);
        await db.update(tronScanState).set({
          lastProcessedBlockNumber: lastProcessedBlockNumber.toString(),
          lastSuccessfulScan: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(tronScanState.id, state.id));
        console.log("[updateTronScanState] Update successful");
      } else {
        console.log("[updateTronScanState] No existing state, creating new");
        await this.createTronScanState({
          lastProcessedBlockNumber: lastProcessedBlockNumber.toString()
        });
      }
    } catch (error) {
      console.error("[updateTronScanState] ERROR:", error);
      console.error("[updateTronScanState] Stack trace:", error instanceof Error ? error.stack : "No stack");
      throw error;
    }
  }
  async updateTronScanStateWithTimestamp(lastProcessedBlockNumber, lastProcessedTimestamp) {
    try {
      console.log("[updateTronScanStateWithTimestamp] Starting update for block:", lastProcessedBlockNumber, "timestamp:", lastProcessedTimestamp);
      const state = await this.getTronScanState();
      if (state) {
        console.log("[updateTronScanStateWithTimestamp] Updating existing state, id:", state.id);
        await db.update(tronScanState).set({
          lastProcessedBlockNumber: lastProcessedBlockNumber.toString(),
          lastProcessedTimestamp,
          lastSuccessfulScan: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        }).where(eq(tronScanState.id, state.id));
        console.log("[updateTronScanStateWithTimestamp] Update successful");
      } else {
        console.log("[updateTronScanStateWithTimestamp] No existing state, creating new");
        await this.createTronScanState({
          lastProcessedBlockNumber: lastProcessedBlockNumber.toString()
        });
      }
    } catch (error) {
      console.error("[updateTronScanStateWithTimestamp] ERROR:", error);
      console.error("[updateTronScanStateWithTimestamp] Stack trace:", error instanceof Error ? error.stack : "No stack");
      throw error;
    }
  }
  // Operator methods
  async getOperator(id) {
    const result = await db.select().from(operators).where(eq(operators.id, id)).limit(1);
    return result[0];
  }
  async getOperatorByLogin(login) {
    const result = await db.select().from(operators).where(eq(operators.login, login)).limit(1);
    return result[0];
  }
  async getAllOperators() {
    return await db.select().from(operators).orderBy(desc(operators.createdAt));
  }
  async createOperator(insertOperator) {
    const result = await db.insert(operators).values(insertOperator).returning();
    return result[0];
  }
  async updateOperatorStatus(id, isActive) {
    await db.update(operators).set({ isActive }).where(eq(operators.id, id));
  }
  async deleteOperator(id) {
    await db.delete(operators).where(eq(operators.id, id));
  }
};
var storage = new PostgresStorage();

// server/utils/telegram.ts
import crypto from "crypto";
function validateTelegramWebAppData(initData, botToken) {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      return null;
    }
    params.delete("hash");
    const dataCheckArr = [];
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    if (computedHash !== hash) {
      return null;
    }
    const userStr = params.get("user");
    const authDate = parseInt(params.get("auth_date") || "0", 10);
    const now = Math.floor(Date.now() / 1e3);
    if (now - authDate > 86400) {
      return null;
    }
    return {
      query_id: params.get("query_id") || void 0,
      user: userStr ? JSON.parse(userStr) : void 0,
      auth_date: authDate,
      hash
    };
  } catch (error) {
    console.error("Error validating Telegram WebApp data:", error);
    return null;
  }
}

// server/controllers/userController.ts
async function authenticateUser(req, res) {
  try {
    const { initData, telegramId, username } = req.body;
    const isDevelopment = process.env.NODE_ENV === "development";
    if (initData) {
      const botToken = process.env.BOT_TOKEN;
      if (!botToken) {
        console.error("BOT_TOKEN is not configured");
        return res.status(500).json({ error: "Server configuration error" });
      }
      const validatedData = validateTelegramWebAppData(initData, botToken);
      if (!validatedData || !validatedData.user) {
        return res.status(401).json({ error: "Invalid Telegram authentication data" });
      }
      const tgUser = validatedData.user;
      const tgId = tgUser.id.toString();
      const tgUsername = tgUser.username || tgUser.first_name || `user_${tgUser.id}`;
      let user = await storage.getUserByTelegramId(tgId);
      if (!user) {
        user = await storage.createUser({
          telegramId: tgId,
          username: tgUsername,
          availableBalance: "0",
          frozenBalance: "0"
        });
      }
      return res.json({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        availableBalance: parseFloat(user.availableBalance),
        frozenBalance: parseFloat(user.frozenBalance),
        registeredAt: user.registeredAt
      });
    }
    if (isDevelopment && telegramId) {
      console.warn("Running in DEMO MODE - no initData validation performed");
      let user = await storage.getUserByTelegramId(telegramId.toString());
      if (!user) {
        user = await storage.createUser({
          telegramId: telegramId.toString(),
          username: username || `user_${telegramId}`,
          availableBalance: "0",
          frozenBalance: "0"
        });
      }
      return res.json({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        availableBalance: parseFloat(user.availableBalance),
        frozenBalance: parseFloat(user.frozenBalance),
        registeredAt: user.registeredAt
      });
    }
    return res.status(401).json({
      error: "Telegram authentication required. Please provide initData."
    });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getUserBalance(req, res) {
  try {
    const { userId } = req.params;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      availableBalance: parseFloat(user.availableBalance),
      frozenBalance: parseFloat(user.frozenBalance)
    });
  } catch (error) {
    console.error("Error getting user balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// server/controllers/paymentController.ts
async function getUserPaymentRequests(req, res) {
  try {
    const { userId } = req.params;
    const requests = await storage.getPaymentRequestsByUserId(userId);
    const formatted = requests.map((req2) => ({
      id: req2.id,
      amountRub: parseFloat(req2.amountRub),
      amountUsdt: parseFloat(req2.amountUsdt),
      frozenRate: parseFloat(req2.frozenRate),
      urgency: req2.urgency,
      hasUrgentFee: req2.hasUrgentFee === 1,
      usdtFrozen: parseFloat(req2.amountUsdt),
      attachments: req2.attachments || [],
      comment: req2.comment || "",
      status: req2.status,
      // receipt is admin-only, not exposed to regular users
      receipt: req2.status === "paid" ? req2.receipt || void 0 : void 0,
      createdAt: req2.createdAt.toISOString()
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Error getting payment requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getPaymentRequest(req, res) {
  try {
    const { requestId } = req.params;
    const request = await storage.getPaymentRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: "Payment request not found" });
    }
    res.json({
      id: request.id,
      amountRub: parseFloat(request.amountRub),
      amountUsdt: parseFloat(request.amountUsdt),
      frozenRate: parseFloat(request.frozenRate),
      urgency: request.urgency,
      hasUrgentFee: request.hasUrgentFee === 1,
      usdtFrozen: parseFloat(request.amountUsdt),
      attachments: request.attachments || [],
      comment: request.comment || "",
      status: request.status,
      createdAt: request.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Error getting payment request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function createPaymentRequest(req, res) {
  try {
    const { userId, amountRub, amountUsdt, frozenRate, urgency, attachments, comment } = req.body;
    if (!userId || !amountRub || !amountUsdt || !frozenRate || !urgency) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const availableBalance = parseFloat(user.availableBalance);
    const requestAmount = parseFloat(amountUsdt);
    if (availableBalance < requestAmount) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const request = await storage.createPaymentRequest({
      userId,
      amountRub: amountRub.toString(),
      amountUsdt: amountUsdt.toString(),
      frozenRate: frozenRate.toString(),
      urgency,
      hasUrgentFee: urgency === "urgent" ? 1 : 0,
      attachments: attachments || [],
      comment: comment || null,
      status: "submitted"
    });
    const newAvailableBalance = (availableBalance - requestAmount).toFixed(8);
    const frozenBalance = parseFloat(user.frozenBalance);
    const newFrozenBalance = (frozenBalance + requestAmount).toFixed(8);
    await storage.updateUserBalance(userId, newAvailableBalance, newFrozenBalance);
    await storage.createNotification({
      userId,
      requestId: request.id,
      message: `\u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 ${parseFloat(amountRub).toLocaleString("ru-RU")} \u20BD \u0441\u043E\u0437\u0434\u0430\u043D\u0430`,
      isRead: 0
    });
    res.json({
      id: request.id,
      amountRub: parseFloat(request.amountRub),
      amountUsdt: parseFloat(request.amountUsdt),
      frozenRate: parseFloat(request.frozenRate),
      urgency: request.urgency,
      hasUrgentFee: request.hasUrgentFee === 1,
      usdtFrozen: parseFloat(request.amountUsdt),
      attachments: request.attachments || [],
      comment: request.comment || "",
      status: request.status,
      receipt: request.receipt || void 0,
      createdAt: request.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Error creating payment request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function updatePaymentRequestStatus(req, res) {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    if (!["submitted", "processing", "paid", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const request = await storage.getPaymentRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: "Payment request not found" });
    }
    const user = await storage.getUser(request.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await storage.updatePaymentRequestStatus(requestId, status);
    let message = "";
    if (status === "paid") {
      const frozenBalance = parseFloat(user.frozenBalance);
      const requestAmount = parseFloat(request.amountUsdt);
      const newFrozenBalance = Math.max(0, frozenBalance - requestAmount).toFixed(8);
      await storage.updateUserBalance(request.userId, user.availableBalance, newFrozenBalance);
      message = `\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u0430`;
    } else if (status === "cancelled" || status === "rejected") {
      const availableBalance = parseFloat(user.availableBalance);
      const frozenBalance = parseFloat(user.frozenBalance);
      const requestAmount = parseFloat(request.amountUsdt);
      const newAvailableBalance = (availableBalance + requestAmount).toFixed(8);
      const newFrozenBalance = Math.max(0, frozenBalance - requestAmount).toFixed(8);
      await storage.updateUserBalance(request.userId, newAvailableBalance, newFrozenBalance);
      message = `\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} ${status === "cancelled" ? "\u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430" : "\u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0430"}. \u0421\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u044B.`;
    } else {
      message = `\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u044F\u0432\u043A\u0438 \u2116${request.id.slice(-6)} \u0438\u0437\u043C\u0435\u043D\u0435\u043D: ${status}`;
    }
    await storage.createNotification({
      userId: request.userId,
      requestId: request.id,
      message,
      isRead: 0
    });
    res.json({ success: true, status });
  } catch (error) {
    console.error("Error updating payment request status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// server/controllers/notificationController.ts
async function getUserNotifications(req, res) {
  try {
    const { userId } = req.params;
    const notifications2 = await storage.getNotificationsByUserId(userId);
    const formatted = notifications2.map((notif) => ({
      id: notif.id,
      requestId: notif.requestId,
      message: notif.message,
      isRead: notif.isRead === 1,
      createdAt: notif.createdAt.toISOString()
    }));
    res.json(formatted);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function markNotificationAsRead(req, res) {
  try {
    const { notificationId } = req.params;
    await storage.markNotificationAsRead(notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getUnreadNotificationsCount(req, res) {
  try {
    const { userId } = req.params;
    const count = await storage.getUnreadNotificationsCount(userId);
    res.json({ count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// server/telegram/bot.ts
import TelegramBot from "node-telegram-bot-api";
var bot = null;
function initializeBot(token) {
  if (bot) {
    return bot;
  }
  bot = new TelegramBot(token, { polling: false });
  bot.setMyCommands([
    { command: "start", description: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435" }
  ]);
  return bot;
}
function getBot() {
  if (!bot) {
    throw new Error("Bot not initialized. Call initializeBot first.");
  }
  return bot;
}
async function setupMenuButton(webAppUrl) {
  const botInstance = getBot();
  try {
    await botInstance.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
        web_app: {
          url: webAppUrl
        }
      }
    });
    console.log("Menu button configured successfully");
  } catch (error) {
    console.error("Error setting up menu button:", error);
  }
}
async function setupWebhook(webhookUrl) {
  const botInstance = getBot();
  try {
    await botInstance.setWebHook(webhookUrl);
    console.log(`Webhook set to: ${webhookUrl}`);
  } catch (error) {
    console.error("Error setting webhook:", error);
    throw error;
  }
}
async function sendNotificationToUser(telegramId, message) {
  try {
    const botInstance = getBot();
    await botInstance.sendMessage(telegramId, message, {
      parse_mode: "HTML"
    });
    console.log(`Notification sent to Telegram user ${telegramId}`);
  } catch (error) {
    console.error(`Error sending notification to Telegram user ${telegramId}:`, error);
  }
}

// server/utils/password.ts
import crypto2 from "crypto";
var ITERATIONS = 1e5;
var KEY_LENGTH = 64;
var DIGEST = "sha512";
function generateSalt() {
  return crypto2.randomBytes(32).toString("hex");
}
function hashPasswordWithSalt(password, salt) {
  return crypto2.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
}
function verifyPasswordWithSalt(password, salt, hash) {
  const verifyHash = hashPasswordWithSalt(password, salt);
  return hash === verifyHash;
}

// server/controllers/adminController.ts
function verifyAdminPassword(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return password === adminPassword;
}
async function adminLogin(req, res) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (!verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Invalid password" });
    }
    res.json({ success: true, message: "Login successful" });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getAllUsers(req, res) {
  try {
    const { password } = req.query;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const allUsers = await storage.getAllUsers();
    const formattedUsers = allUsers.map((user) => ({
      id: user.id,
      telegramId: user.telegramId,
      username: user.username,
      availableBalance: parseFloat(user.availableBalance),
      frozenBalance: parseFloat(user.frozenBalance),
      registeredAt: user.registeredAt.toISOString()
    }));
    res.json(formattedUsers);
  } catch (error) {
    console.error("Error getting all users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getAllPaymentRequests(req, res) {
  try {
    const { password, status, userId, urgency } = req.query;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    let requests = await storage.getAllPaymentRequests();
    if (status && status !== "all") {
      requests = requests.filter((r) => r.status === status);
    }
    if (userId) {
      requests = requests.filter((r) => r.userId === userId);
    }
    if (urgency && urgency !== "all") {
      requests = requests.filter((r) => r.urgency === urgency);
    }
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const user = await storage.getUser(request.userId);
        return {
          id: request.id,
          userId: request.userId,
          username: user?.username || "Unknown",
          amountRub: parseFloat(request.amountRub),
          amountUsdt: parseFloat(request.amountUsdt),
          frozenRate: parseFloat(request.frozenRate),
          urgency: request.urgency,
          status: request.status,
          createdAt: request.createdAt.toISOString()
        };
      })
    );
    res.json(requestsWithUsers);
  } catch (error) {
    console.error("Error getting all payment requests:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function updateUserBalance(req, res) {
  try {
    const { userId } = req.params;
    const { password, availableBalance, frozenBalance } = req.body;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (availableBalance === void 0 || frozenBalance === void 0) {
      return res.status(400).json({ error: "Both availableBalance and frozenBalance are required" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await storage.updateUserBalance(
      userId,
      availableBalance.toString(),
      frozenBalance.toString()
    );
    await storage.createNotification({
      userId,
      message: `\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438\u0437\u043C\u0435\u043D\u0438\u043B \u0432\u0430\u0448 \u0431\u0430\u043B\u0430\u043D\u0441. \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E: ${availableBalance} USDT, \u0417\u0430\u043C\u043E\u0440\u043E\u0436\u0435\u043D\u043E: ${frozenBalance} USDT`,
      isRead: 0
    });
    res.json({ success: true, message: "Balance updated successfully" });
  } catch (error) {
    console.error("Error updating user balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function addUserDeposit(req, res) {
  try {
    const { userId } = req.params;
    const { password, amount } = req.body;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid deposit amount is required" });
    }
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const currentAvailable = parseFloat(user.availableBalance);
    const newAvailable = (currentAvailable + amount).toFixed(8);
    await storage.updateUserBalance(userId, newAvailable, user.frozenBalance);
    await storage.createNotification({
      userId,
      message: `\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0441\u0447\u0435\u0442\u0430: +${amount} USDT. \u041D\u043E\u0432\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441: ${newAvailable} USDT`,
      isRead: 0
    });
    res.json({
      success: true,
      message: "Deposit added successfully",
      newBalance: parseFloat(newAvailable)
    });
  } catch (error) {
    console.error("Error adding deposit:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function approvePaymentRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { password } = req.body;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const request = await storage.getPaymentRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: "Payment request not found" });
    }
    if (request.status === "paid") {
      return res.status(400).json({ error: "Payment request already paid" });
    }
    const user = await storage.getUser(request.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await storage.updatePaymentRequestStatus(requestId, "paid");
    const frozenBalance = parseFloat(user.frozenBalance);
    const requestAmount = parseFloat(request.amountUsdt);
    const newFrozenBalance = Math.max(0, frozenBalance - requestAmount).toFixed(8);
    await storage.updateUserBalance(request.userId, user.availableBalance, newFrozenBalance);
    await storage.createNotification({
      userId: request.userId,
      requestId: request.id,
      message: `\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} \u043E\u0434\u043E\u0431\u0440\u0435\u043D\u0430 \u0438 \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u0430. \u0421\u0443\u043C\u043C\u0430: ${parseFloat(request.amountRub).toLocaleString("ru-RU")} \u20BD`,
      isRead: 0
    });
    res.json({
      success: true,
      message: "Payment request approved and paid"
    });
  } catch (error) {
    console.error("Error approving payment request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function cancelPaymentRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { password } = req.body;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const request = await storage.getPaymentRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: "Payment request not found" });
    }
    if (request.status === "paid") {
      return res.status(400).json({ error: "Cannot cancel paid request" });
    }
    if (request.status === "cancelled") {
      return res.status(400).json({ error: "Payment request already cancelled" });
    }
    const user = await storage.getUser(request.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await storage.updatePaymentRequestStatus(requestId, "cancelled");
    const availableBalance = parseFloat(user.availableBalance);
    const frozenBalance = parseFloat(user.frozenBalance);
    const requestAmount = parseFloat(request.amountUsdt);
    const newAvailableBalance = (availableBalance + requestAmount).toFixed(8);
    const newFrozenBalance = Math.max(0, frozenBalance - requestAmount).toFixed(8);
    await storage.updateUserBalance(request.userId, newAvailableBalance, newFrozenBalance);
    await storage.createNotification({
      userId: request.userId,
      requestId: request.id,
      message: `\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} \u043E\u0442\u043C\u0435\u043D\u0435\u043D\u0430 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u043C. \u0421\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u044B \u043D\u0430 \u0441\u0447\u0435\u0442.`,
      isRead: 0
    });
    res.json({
      success: true,
      message: "Payment request cancelled, funds returned to user"
    });
  } catch (error) {
    console.error("Error cancelling payment request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getPaymentRequestForAdmin(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.query;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const request = await storage.getPaymentRequest(id);
    if (!request) {
      return res.status(404).json({ error: "Payment request not found" });
    }
    const user = await storage.getUser(request.userId);
    res.json({
      id: request.id,
      userId: request.userId,
      username: user?.username || "Unknown",
      amountRub: parseFloat(request.amountRub),
      amountUsdt: parseFloat(request.amountUsdt),
      frozenRate: parseFloat(request.frozenRate),
      urgency: request.urgency,
      hasUrgentFee: request.hasUrgentFee === 1,
      usdtFrozen: parseFloat(request.amountUsdt),
      attachments: request.attachments || [],
      comment: request.comment || "",
      status: request.status,
      receipt: request.receipt || null,
      adminComment: request.adminComment || "",
      createdAt: request.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Error getting payment request for admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function processPaymentRequest(req, res) {
  try {
    const { id } = req.params;
    const { password, status, receipt, adminComment, newAmountRub } = req.body;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!["paid", "rejected"].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "paid" or "rejected"' });
    }
    if (receipt) {
      const allowedMimeTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
      if (!receipt.mimeType || !allowedMimeTypes.includes(receipt.mimeType)) {
        return res.status(400).json({ error: "Invalid receipt mime type. Allowed: PDF, JPG, PNG" });
      }
      const base64Length = receipt.value?.length || 0;
      const approximateFileSize = base64Length * 3 / 4;
      const maxSize = 10 * 1024 * 1024;
      if (approximateFileSize > maxSize) {
        return res.status(400).json({ error: "Receipt file too large. Maximum size: 10MB" });
      }
      if (!receipt.name || !receipt.type) {
        return res.status(400).json({ error: "Receipt must include name and type" });
      }
    }
    const request = await storage.getPaymentRequest(id);
    if (!request) {
      return res.status(404).json({ error: "Payment request not found" });
    }
    if (request.status === "paid" || request.status === "rejected") {
      return res.status(400).json({ error: `Payment request already ${request.status}` });
    }
    const user = await storage.getUser(request.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    let finalAmountRub = parseFloat(request.amountRub);
    let finalAmountUsdt = parseFloat(request.amountUsdt);
    const frozenRate = parseFloat(request.frozenRate);
    let amountAdjustmentUsdt = 0;
    if (newAmountRub && Math.abs(newAmountRub - finalAmountRub) > 0.01) {
      const newAmountUsdt = newAmountRub / frozenRate;
      const oldAmountUsdt = parseFloat(request.amountUsdt);
      amountAdjustmentUsdt = newAmountUsdt - oldAmountUsdt;
      if (amountAdjustmentUsdt > 1e-8) {
        const availableBalance2 = parseFloat(user.availableBalance);
        if (availableBalance2 < amountAdjustmentUsdt) {
          return res.status(400).json({
            error: `\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0431\u0430\u043B\u0430\u043D\u0441\u0430 \u043A\u043B\u0438\u0435\u043D\u0442\u0430. \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E: ${availableBalance2.toFixed(2)} USDT, \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E: ${amountAdjustmentUsdt.toFixed(2)} USDT. \u041E\u0442\u043C\u0435\u043D\u0438\u0442\u0435 \u0437\u0430\u044F\u0432\u043A\u0443.`,
            insufficientBalance: true,
            available: availableBalance2.toFixed(2),
            required: amountAdjustmentUsdt.toFixed(2)
          });
        }
      }
      finalAmountRub = newAmountRub;
      finalAmountUsdt = newAmountUsdt;
    }
    const updates = { status };
    if (receipt) updates.receipt = receipt;
    if (adminComment) updates.adminComment = adminComment;
    if (newAmountRub && Math.abs(newAmountRub - parseFloat(request.amountRub)) > 0.01) {
      updates.amountRub = finalAmountRub.toFixed(2);
      updates.amountUsdt = finalAmountUsdt.toFixed(8);
    }
    await storage.updatePaymentRequestFull(id, updates);
    let frozenBalance = parseFloat(user.frozenBalance);
    let availableBalance = parseFloat(user.availableBalance);
    if (amountAdjustmentUsdt !== 0) {
      if (amountAdjustmentUsdt > 0) {
        availableBalance -= amountAdjustmentUsdt;
        frozenBalance += amountAdjustmentUsdt;
      } else {
        const excessUsdt = Math.abs(amountAdjustmentUsdt);
        availableBalance += excessUsdt;
        frozenBalance -= excessUsdt;
      }
    }
    const requestAmount = finalAmountUsdt;
    let notificationMessage = "";
    let telegramMessage = "";
    if (status === "paid") {
      frozenBalance = Math.max(0, frozenBalance - requestAmount);
      await storage.updateUserBalance(request.userId, availableBalance.toFixed(8), frozenBalance.toFixed(8));
      notificationMessage = `\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u0430. \u0421\u0443\u043C\u043C\u0430: ${finalAmountRub.toLocaleString("ru-RU")} \u20BD`;
      if (adminComment) {
        notificationMessage += `
\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439: ${adminComment}`;
      }
      telegramMessage = `\u2705 <b>\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u0430</b>

\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u0430.
\u0421\u0443\u043C\u043C\u0430: ${finalAmountRub.toLocaleString("ru-RU")} \u20BD
USDT: ${finalAmountUsdt.toFixed(2)} USDT`;
      if (adminComment) {
        telegramMessage += `

\u{1F4AC} \u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430: ${adminComment}`;
      }
    } else if (status === "rejected") {
      availableBalance += requestAmount;
      frozenBalance = Math.max(0, frozenBalance - requestAmount);
      await storage.updateUserBalance(request.userId, availableBalance.toFixed(8), frozenBalance.toFixed(8));
      notificationMessage = `\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0430. \u0421\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u044B \u043D\u0430 \u0441\u0447\u0435\u0442.`;
      if (adminComment) {
        notificationMessage += `
\u041F\u0440\u0438\u0447\u0438\u043D\u0430: ${adminComment}`;
      }
      telegramMessage = `\u274C <b>\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0430</b>

\u0417\u0430\u044F\u0432\u043A\u0430 \u2116${request.id.slice(-6)} \u0431\u044B\u043B\u0430 \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0430.
\u0421\u0443\u043C\u043C\u0430: ${finalAmountRub.toLocaleString("ru-RU")} \u20BD
\u0421\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0432 \u0440\u0430\u0437\u043C\u0435\u0440\u0435 ${finalAmountUsdt.toFixed(2)} USDT \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u044B \u043D\u0430 \u0432\u0430\u0448 \u0431\u0430\u043B\u0430\u043D\u0441.`;
      if (adminComment) {
        telegramMessage += `

\u{1F4AC} \u041F\u0440\u0438\u0447\u0438\u043D\u0430 \u043E\u0442\u043A\u0430\u0437\u0430: ${adminComment}`;
      }
    }
    await storage.createNotification({
      userId: request.userId,
      requestId: request.id,
      message: notificationMessage,
      isRead: 0
    });
    try {
      await sendNotificationToUser(user.telegramId, telegramMessage);
    } catch (error) {
      console.error("Failed to send Telegram notification:", error);
    }
    const updatedRequest = await storage.getPaymentRequest(id);
    if (!updatedRequest) {
      return res.status(500).json({ error: "Failed to fetch updated payment request" });
    }
    res.json({
      success: true,
      message: `Payment request ${status}`,
      paymentRequest: {
        id: updatedRequest.id,
        userId: updatedRequest.userId,
        username: user.username,
        amountRub: parseFloat(updatedRequest.amountRub),
        amountUsdt: parseFloat(updatedRequest.amountUsdt),
        frozenRate: parseFloat(updatedRequest.frozenRate),
        urgency: updatedRequest.urgency,
        hasUrgentFee: updatedRequest.hasUrgentFee === 1,
        usdtFrozen: parseFloat(updatedRequest.amountUsdt),
        attachments: updatedRequest.attachments || [],
        comment: updatedRequest.comment || "",
        status: updatedRequest.status,
        receipt: updatedRequest.receipt || null,
        createdAt: updatedRequest.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Error processing payment request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function getAllOperators(req, res) {
  try {
    const { password } = req.query;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const operators2 = await storage.getAllOperators();
    const formattedOperators = operators2.map((op) => ({
      id: op.id,
      login: op.login,
      isActive: op.isActive === 1,
      createdAt: op.createdAt.toISOString()
    }));
    res.json(formattedOperators);
  } catch (error) {
    console.error("Error getting operators:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function createOperator(req, res) {
  try {
    const { password, login, operatorPassword } = req.body;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!login || !operatorPassword) {
      return res.status(400).json({ error: "Login and password are required" });
    }
    const existingOperator = await storage.getOperatorByLogin(login);
    if (existingOperator) {
      return res.status(400).json({ error: "\u041B\u043E\u0433\u0438\u043D \u0443\u0436\u0435 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F" });
    }
    const salt = generateSalt();
    const passwordHash = hashPasswordWithSalt(operatorPassword, salt);
    const operator = await storage.createOperator({
      login,
      passwordHash,
      salt,
      isActive: 1
    });
    res.json({
      id: operator.id,
      login: operator.login,
      isActive: operator.isActive === 1,
      createdAt: operator.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Error creating operator:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function updateOperatorStatus(req, res) {
  try {
    const { password, isActive } = req.body;
    const { id } = req.params;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }
    await storage.updateOperatorStatus(id, isActive ? 1 : 0);
    res.json({ success: true, message: "\u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D" });
  } catch (error) {
    console.error("Error updating operator status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function deleteOperator(req, res) {
  try {
    const { password } = req.body;
    const { id } = req.params;
    if (!password || !verifyAdminPassword(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await storage.deleteOperator(id);
    res.json({ success: true, message: "\u041E\u043F\u0435\u0440\u0430\u0442\u043E\u0440 \u0443\u0434\u0430\u043B\u0435\u043D" });
  } catch (error) {
    console.error("Error deleting operator:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// server/services/depositUniqueness.ts
var MIN_DEPOSIT_USDT = 30;
var MAX_DEPOSIT_USDT = 2e4;
var MAX_DELTA_CENTS = BigInt(1e6);
var SCALE = BigInt(1e8);
function validateDepositAmount(amount) {
  if (amount < MIN_DEPOSIT_USDT) {
    return { valid: false, error: `\u041C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u043F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F ${MIN_DEPOSIT_USDT} USDT` };
  }
  if (amount > MAX_DEPOSIT_USDT) {
    return { valid: false, error: `\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0443\u043C\u043C\u0430 \u043F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u044F ${MAX_DEPOSIT_USDT} USDT` };
  }
  return { valid: true };
}
function decimalStringToBigInt2(value) {
  let str;
  if (typeof value === "number") {
    str = value.toLocaleString("en-US", {
      useGrouping: false,
      minimumFractionDigits: 0,
      maximumFractionDigits: 20
    });
  } else {
    str = value;
  }
  const isNegative = str.startsWith("-");
  const absStr = isNegative ? str.slice(1) : str;
  const [intPart, decPart = ""] = absStr.split(".");
  if (!decPart || decPart.length <= 8) {
    const paddedDec = decPart.padEnd(8, "0");
    const result2 = BigInt(intPart || "0") * SCALE + BigInt(paddedDec);
    return isNegative ? -result2 : result2;
  }
  const first8Digits = decPart.slice(0, 8);
  const digit9 = parseInt(decPart[8] || "0", 10);
  let fractionalScaled = BigInt(first8Digits);
  let integerPart = BigInt(intPart || "0");
  if (digit9 >= 5) {
    fractionalScaled += BigInt(1);
    if (fractionalScaled >= SCALE) {
      integerPart += BigInt(1);
      fractionalScaled = BigInt(0);
    }
  }
  const result = integerPart * SCALE + fractionalScaled;
  return isNegative ? -result : result;
}
function bigIntToDecimal2(scaled) {
  return Number(scaled) / Number(SCALE);
}
async function generateUniquePayableAmount(requestedAmount) {
  const scaledRequested = decimalStringToBigInt2(requestedAmount);
  const activeDeposits = await storage.getActiveDeposits();
  const usedAmountsScaled = new Set(
    activeDeposits.map((d) => d.payableAmount ? decimalStringToBigInt2(d.payableAmount) : null).filter((amt) => amt !== null)
  );
  if (!usedAmountsScaled.has(scaledRequested)) {
    return bigIntToDecimal2(scaledRequested);
  }
  let deltaScaled = BigInt(1);
  let attempts = 0;
  const maxAttempts = 100;
  while (attempts < maxAttempts && deltaScaled <= MAX_DELTA_CENTS) {
    const candidateScaled = scaledRequested - deltaScaled;
    if (candidateScaled < scaledRequested - MAX_DELTA_CENTS) {
      break;
    }
    if (!usedAmountsScaled.has(candidateScaled)) {
      return bigIntToDecimal2(candidateScaled);
    }
    deltaScaled += BigInt(1);
    attempts++;
  }
  const requestedStr = formatUsdtBalance(bigIntToDecimal2(scaledRequested));
  throw new Error(
    `\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0443\u043D\u0438\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0441\u0443\u043C\u043C\u0443 \u0434\u043B\u044F ${requestedStr} USDT. \u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u043D\u043E\u0433\u043E \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0434\u0435\u043F\u043E\u0437\u0438\u0442\u043E\u0432 \u0441 \u043F\u043E\u0445\u043E\u0436\u0438\u043C\u0438 \u0441\u0443\u043C\u043C\u0430\u043C\u0438. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435.`
  );
}

// server/controllers/depositController.ts
function verifyAdminPassword2(password) {
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return password === adminPassword;
}
var DEPOSIT_EXPIRATION_MINUTES = 10;
async function createAutomatedDeposit(req, res) {
  try {
    const { userId, requestedAmount: rawRequestedAmount } = req.body;
    if (!userId || rawRequestedAmount === void 0 || rawRequestedAmount === null) {
      return res.status(400).json({ error: "userId \u0438 requestedAmount \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B" });
    }
    const requestedAmount = parseFloat(rawRequestedAmount);
    if (isNaN(requestedAmount)) {
      return res.status(400).json({ error: "requestedAmount \u0434\u043E\u043B\u0436\u0435\u043D \u0431\u044B\u0442\u044C \u0447\u0438\u0441\u043B\u043E\u043C" });
    }
    const validation = validateDepositAmount(requestedAmount);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    const payableAmount = await generateUniquePayableAmount(requestedAmount);
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + DEPOSIT_EXPIRATION_MINUTES);
    const insertDeposit = {
      userId,
      amount: formatUsdtBalance(requestedAmount),
      requestedAmount: formatUsdtBalance(requestedAmount),
      payableAmount: formatUsdtBalance(payableAmount),
      walletAddress: getMasterWalletAddress(),
      expiresAt,
      status: "pending",
      txHash: null
    };
    const deposit = await storage.createDeposit(insertDeposit);
    await storage.createNotification({
      userId,
      message: `\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u043F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 ${formatUsdtBalance(requestedAmount)} USDT. \u041F\u0435\u0440\u0435\u0432\u0435\u0434\u0438\u0442\u0435 \u0440\u043E\u0432\u043D\u043E ${formatUsdtBalance(payableAmount)} USDT \u043D\u0430 \u0443\u043A\u0430\u0437\u0430\u043D\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 10 \u043C\u0438\u043D\u0443\u0442.`,
      isRead: 0
    });
    res.json({
      id: deposit.id,
      walletAddress: getMasterWalletAddress(),
      requestedAmount,
      payableAmount,
      expiresAt: expiresAt.toISOString(),
      status: deposit.status,
      createdAt: deposit.createdAt.toISOString()
    });
  } catch (error) {
    console.error("Error creating automated deposit:", error);
    const errorMessage = error instanceof Error ? error.message : "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0434\u0435\u043F\u043E\u0437\u0438\u0442";
    res.status(500).json({ error: errorMessage });
  }
}
async function createDeposit(req, res) {
  try {
    const { userId, amount, txHash } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ error: "userId and amount are required" });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be positive" });
    }
    const insertDeposit = {
      userId,
      amount: formatUsdtBalance(amount),
      status: "pending",
      txHash: txHash || null
    };
    const deposit = await storage.createDeposit(insertDeposit);
    await storage.createNotification({
      userId,
      message: `\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u0434\u0435\u043F\u043E\u0437\u0438\u0442 ${amount} USDT. \u041E\u0436\u0438\u0434\u0430\u0435\u0442 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u043E\u043C.`,
      isRead: 0
    });
    res.json(deposit);
  } catch (error) {
    console.error("Error creating deposit:", error);
    res.status(500).json({ error: "Failed to create deposit" });
  }
}
async function getUserDeposits(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const deposits2 = await storage.getDepositsByUserId(userId);
    const formattedDeposits = deposits2.map((deposit) => ({
      ...deposit,
      amount: parseFloat(deposit.amount)
    }));
    res.json(formattedDeposits);
  } catch (error) {
    console.error("Error getting user deposits:", error);
    res.status(500).json({ error: "Failed to get deposits" });
  }
}
async function getPendingDeposits(req, res) {
  try {
    const { password } = req.query;
    if (!password || !verifyAdminPassword2(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const deposits2 = await storage.getPendingDeposits();
    const users2 = await storage.getAllUsers();
    const userMap = new Map(users2.map((u) => [u.id, u]));
    const formattedDeposits = deposits2.map((deposit) => {
      const user = userMap.get(deposit.userId);
      return {
        ...deposit,
        amount: parseFloat(deposit.amount),
        username: user?.username || "Unknown"
      };
    });
    res.json(formattedDeposits);
  } catch (error) {
    console.error("Error getting pending deposits:", error);
    res.status(500).json({ error: "Failed to get pending deposits" });
  }
}
async function confirmDeposit(req, res) {
  try {
    const { depositId } = req.params;
    const { password, adminId = "admin" } = req.body;
    if (!password || !verifyAdminPassword2(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const deposit = await storage.getDeposit(depositId);
    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }
    if (deposit.status !== "pending") {
      return res.status(400).json({ error: "Deposit is not pending" });
    }
    const user = await storage.getUser(deposit.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const currentAvailable = parseFloat(user.availableBalance);
    const depositAmount = parseFloat(deposit.amount);
    const newAvailable = currentAvailable + depositAmount;
    await storage.updateUserBalance(
      deposit.userId,
      formatUsdtBalance(newAvailable),
      user.frozenBalance
    );
    await storage.confirmDeposit(depositId, adminId);
    await storage.createNotification({
      userId: deposit.userId,
      message: `\u0414\u0435\u043F\u043E\u0437\u0438\u0442 \u043D\u0430 ${formatUsdtBalance(depositAmount)} USDT \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D`,
      isRead: 0
    });
    res.json({
      success: true,
      message: "Deposit confirmed",
      newBalance: parseFloat(formatUsdtBalance(newAvailable))
    });
  } catch (error) {
    console.error("Error confirming deposit:", error);
    res.status(500).json({ error: "Failed to confirm deposit" });
  }
}
async function rejectDeposit(req, res) {
  try {
    const { depositId } = req.params;
    const { password } = req.body;
    if (!password || !verifyAdminPassword2(password)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const deposit = await storage.getDeposit(depositId);
    if (!deposit) {
      return res.status(404).json({ error: "Deposit not found" });
    }
    if (deposit.status !== "pending") {
      return res.status(400).json({ error: "Deposit is not pending" });
    }
    await storage.rejectDeposit(depositId);
    await storage.createNotification({
      userId: deposit.userId,
      message: "\u0414\u0435\u043F\u043E\u0437\u0438\u0442 \u043E\u0442\u043A\u043B\u043E\u043D\u0451\u043D",
      isRead: 0
    });
    res.json({
      success: true,
      message: "Deposit rejected"
    });
  } catch (error) {
    console.error("Error rejecting deposit:", error);
    res.status(500).json({ error: "Failed to reject deposit" });
  }
}

// server/controllers/operatorController.ts
async function operatorLogin(req, res) {
  try {
    const { login, password } = req.body;
    if (!login || !password) {
      return res.status(400).json({ message: "\u041B\u043E\u0433\u0438\u043D \u0438 \u043F\u0430\u0440\u043E\u043B\u044C \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u044B" });
    }
    const operator = await storage.getOperatorByLogin(login);
    if (!operator) {
      return res.status(401).json({ message: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043B\u043E\u0433\u0438\u043D \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C" });
    }
    if (operator.isActive === 0) {
      return res.status(403).json({ message: "\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430 \u0434\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D" });
    }
    const isPasswordValid = verifyPasswordWithSalt(password, operator.salt, operator.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043B\u043E\u0433\u0438\u043D \u0438\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C" });
    }
    if (req.session) {
      req.session.operatorId = operator.id;
    }
    res.json({
      id: operator.id,
      login: operator.login,
      createdAt: operator.createdAt
    });
  } catch (error) {
    console.error("Operator login error:", error);
    res.status(500).json({ message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0432\u0445\u043E\u0434\u0430" });
  }
}
async function getPaymentRequestsForOperator(req, res) {
  try {
    const { operatorId } = req.params;
    const { status } = req.query;
    const operator = await storage.getOperator(operatorId);
    if (!operator || operator.isActive === 0) {
      return res.status(403).json({ message: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
    }
    let requests = await storage.getAllPaymentRequests();
    if (status && status !== "all") {
      requests = requests.filter((r) => r.status === status);
    }
    const requestsWithUsernames = await Promise.all(
      requests.map(async (request) => {
        const user = await storage.getUser(request.userId);
        return {
          ...request,
          username: user?.username || "Unknown"
        };
      })
    );
    res.json(requestsWithUsernames);
  } catch (error) {
    console.error("Get payment requests error:", error);
    res.status(500).json({ message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0437\u0430\u044F\u0432\u043E\u043A" });
  }
}
async function operatorProcessPayment(req, res) {
  try {
    const { operatorId, requestId } = req.params;
    const { status, adminComment, receipt, amountRub } = req.body;
    const operator = await storage.getOperator(operatorId);
    if (!operator || operator.isActive === 0) {
      return res.status(403).json({ message: "\u0414\u043E\u0441\u0442\u0443\u043F \u0437\u0430\u043F\u0440\u0435\u0449\u0435\u043D" });
    }
    if (!["paid", "rejected", "processing"].includes(status)) {
      return res.status(400).json({ message: "\u041D\u0435\u0434\u043E\u043F\u0443\u0441\u0442\u0438\u043C\u044B\u0439 \u0441\u0442\u0430\u0442\u0443\u0441" });
    }
    const request = await storage.getPaymentRequest(requestId);
    if (!request) {
      return res.status(404).json({ message: "\u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u0430" });
    }
    const updates = { status };
    if (adminComment) updates.adminComment = adminComment;
    if (receipt) updates.receipt = receipt;
    if (amountRub) updates.amountRub = amountRub;
    await storage.updatePaymentRequestFull(requestId, updates);
    if (status === "paid" || status === "rejected") {
      const user = await storage.getUser(request.userId);
      if (user) {
        if (status === "paid") {
          const newFrozen = parseFloat(user.frozenBalance) - parseFloat(request.amountUsdt);
          await storage.updateUserBalance(
            request.userId,
            user.availableBalance,
            newFrozen.toString()
          );
        } else if (status === "rejected") {
          const newAvailable = parseFloat(user.availableBalance) + parseFloat(request.amountUsdt);
          const newFrozen = parseFloat(user.frozenBalance) - parseFloat(request.amountUsdt);
          await storage.updateUserBalance(
            request.userId,
            newAvailable.toString(),
            newFrozen.toString()
          );
        }
        await storage.createNotification({
          userId: request.userId,
          requestId: request.id,
          message: status === "paid" ? `\u0412\u0430\u0448\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 ${request.amountRub} \u20BD \u043E\u043F\u043B\u0430\u0447\u0435\u043D\u0430` : `\u0412\u0430\u0448\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 ${request.amountRub} \u20BD \u043E\u0442\u043A\u043B\u043E\u043D\u0435\u043D\u0430`
        });
      }
    }
    res.json({ message: "\u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u0430" });
  } catch (error) {
    console.error("Process payment error:", error);
    res.status(500).json({ message: "\u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0437\u0430\u044F\u0432\u043A\u0438" });
  }
}

// server/telegram/webhooks.ts
async function handleWebhook(req, res) {
  try {
    const update = req.body;
    const bot2 = getBot();
    if (update.message?.text === "/start") {
      const chatId = update.message.chat.id;
      const webAppUrl = process.env.WEBAPP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : "");
      if (!webAppUrl) {
        console.error("[Webhook] CRITICAL: WebApp URL is not configured. Set WEBAPP_URL or REPLIT_DOMAINS environment variable.");
        await bot2.sendMessage(chatId, "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 Romax Pay! \u{1F4B0}\n\n\u041F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u043F\u043E\u0437\u0436\u0435.");
        return res.json({ ok: false, reason: "webapp_url_missing" });
      }
      await bot2.sendMessage(chatId, "\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 Romax Pay! \u{1F4B0}", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u0435",
                web_app: { url: webAppUrl }
              }
            ]
          ]
        }
      });
    }
    if (update.callback_query) {
      await bot2.answerCallbackQuery(update.callback_query.id);
    }
    res.json({ ok: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
async function verifyWebhook(_req, res) {
  try {
    const bot2 = getBot();
    const info = await bot2.getWebHookInfo();
    res.json({
      url: info.url,
      hasCustomCertificate: info.has_custom_certificate,
      pendingUpdateCount: info.pending_update_count,
      lastErrorDate: info.last_error_date,
      lastErrorMessage: info.last_error_message
    });
  } catch (error) {
    console.error("Error getting webhook info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// server/middleware/operatorAuth.ts
function requireOperatorAuth(req, res, next) {
  if (!req.session || !req.session.operatorId) {
    return res.status(401).json({ message: "\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044F \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044F \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440\u0430" });
  }
  next();
}

// server/services/exchangeRate.ts
var cachedRate = null;
var updateInterval = null;
var EXCHANGE_API_URL = "https://open.er-api.com/v6/latest/USD";
var UPDATE_INTERVAL_MS = 30 * 60 * 1e3;
var MIN_VALID_RATE = 70;
var MAX_VALID_RATE = 120;
function isValidRate(rate) {
  return rate >= MIN_VALID_RATE && rate <= MAX_VALID_RATE && !isNaN(rate) && isFinite(rate);
}
async function fetchUsdRubRate() {
  try {
    const response = await fetch(EXCHANGE_API_URL);
    if (!response.ok) {
      throw new Error(`ExchangeRate API returned status ${response.status}`);
    }
    const data = await response.json();
    if (data.result !== "success") {
      throw new Error("ExchangeRate API returned unsuccessful result");
    }
    const rawRate = data.rates.RUB;
    const adjustedRate = rawRate * 0.995;
    const rate = Math.round(adjustedRate * 100) / 100;
    if (!rate || !isValidRate(rate)) {
      throw new Error(`Invalid rate: ${rate} (expected ${MIN_VALID_RATE}-${MAX_VALID_RATE})`);
    }
    console.log(`\u2713 Successfully fetched rate: ${rawRate.toFixed(2)} RUB/USD, adjusted: ${rate.toFixed(2)} RUB/USD (-0.5%)`);
    return {
      rate,
      source: "\u0411\u0438\u0440\u0436\u0435\u0432\u043E\u0439 \u043A\u0443\u0440\u0441 (\u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043A\u0430\u0436\u0434\u044B\u0435 30 \u043C\u0438\u043D\u0443\u0442)"
    };
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error instanceof Error ? error.message : error);
    throw error;
  }
}
async function updateExchangeRate() {
  try {
    const { rate, source } = await fetchUsdRubRate();
    cachedRate = {
      rate,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source
    };
  } catch (error) {
    console.error("Error updating exchange rate:", error instanceof Error ? error.message : error);
    if (!cachedRate) {
      console.warn("Using fallback rate as initial cache is empty");
      cachedRate = {
        rate: 95,
        // Reasonable fallback
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        source: "\u0420\u0435\u0437\u0435\u0440\u0432\u043D\u044B\u0439 \u043A\u0443\u0440\u0441 (API \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B)"
      };
    } else {
      console.log(`Using last known rate: ${cachedRate.rate.toFixed(2)} RUB/USD from ${cachedRate.timestamp}`);
    }
  }
}
async function startExchangeRateService() {
  console.log("Starting exchange rate service...");
  await updateExchangeRate();
  if (updateInterval) {
    clearInterval(updateInterval);
  }
  updateInterval = setInterval(async () => {
    await updateExchangeRate();
  }, UPDATE_INTERVAL_MS);
  const intervalMinutes = UPDATE_INTERVAL_MS / (60 * 1e3);
  const requestsPerDay = Math.floor(24 * 60 / intervalMinutes);
  const requestsPerMonth = requestsPerDay * 30;
  console.log(`Exchange rate service started. Updates every ${intervalMinutes} minutes.`);
  console.log(`Estimated usage: ${requestsPerDay} requests/day, ${requestsPerMonth} requests/month (limit: 1500).`);
}
function getCurrentExchangeRate() {
  if (!cachedRate) {
    return {
      rate: 95,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      source: "\u0411\u0438\u0440\u0436\u0435\u0432\u043E\u0439 \u043A\u0443\u0440\u0441 (\u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430...)"
    };
  }
  return cachedRate;
}

// server/routes.ts
async function registerRoutes(app2) {
  app2.set("trust proxy", 1);
  app2.use(helmet({
    contentSecurityPolicy: false
    // Allow Telegram WebApp
  }));
  app2.use(cors({
    origin: process.env.NODE_ENV === "production" ? ["https://telegram.org", process.env.REPLIT_DOMAINS || ""] : "*",
    credentials: true
  }));
  app2.use(session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3
      // 24 hours
    }
  }));
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1e3,
    // 15 minutes
    max: process.env.NODE_ENV === "production" ? 100 : 1e3,
    // Higher limit in development for polling
    standardHeaders: true,
    legacyHeaders: false
  });
  app2.use("/api/", limiter);
  app2.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.get("/test-logging", (_req, res) => {
    console.log("[TEST] This is a test log message");
    res.json({ message: "test logging endpoint" });
  });
  app2.post("/api/user/auth", authenticateUser);
  app2.get("/api/user/:userId/balance", getUserBalance);
  app2.get("/api/payments/user/:userId", getUserPaymentRequests);
  app2.get("/api/payments/:requestId", getPaymentRequest);
  app2.post("/api/payments/create", createPaymentRequest);
  app2.patch("/api/payments/:requestId/status", updatePaymentRequestStatus);
  app2.get("/api/notifications/user/:userId", getUserNotifications);
  app2.get("/api/notifications/user/:userId/unread-count", getUnreadNotificationsCount);
  app2.patch("/api/notifications/:notificationId/read", markNotificationAsRead);
  app2.post("/api/deposits/create-automated", createAutomatedDeposit);
  app2.post("/api/deposits/create", createDeposit);
  app2.get("/api/deposits/user/:userId", getUserDeposits);
  app2.get("/api/exchange-rate", (_req, res) => {
    const exchangeRateData = getCurrentExchangeRate();
    res.json(exchangeRateData);
  });
  app2.post("/api/admin/login", adminLogin);
  app2.get("/api/admin/users", getAllUsers);
  app2.get("/api/admin/payments", getAllPaymentRequests);
  app2.get("/api/admin/payments/:id", getPaymentRequestForAdmin);
  app2.post("/api/admin/user/:userId/balance", updateUserBalance);
  app2.post("/api/admin/user/:userId/deposit", addUserDeposit);
  app2.post("/api/admin/payment/:requestId/approve", approvePaymentRequest);
  app2.post("/api/admin/payment/:requestId/cancel", cancelPaymentRequest);
  app2.patch("/api/admin/payments/:id/process", processPaymentRequest);
  app2.get("/api/admin/deposits/pending", getPendingDeposits);
  app2.post("/api/admin/deposits/:depositId/confirm", confirmDeposit);
  app2.post("/api/admin/deposits/:depositId/reject", rejectDeposit);
  app2.get("/api/admin/operators", getAllOperators);
  app2.post("/api/admin/operators", createOperator);
  app2.patch("/api/admin/operators/:id/status", updateOperatorStatus);
  app2.delete("/api/admin/operators/:id", deleteOperator);
  app2.post("/api/operator/login", operatorLogin);
  app2.get("/api/operator/:operatorId/payments", requireOperatorAuth, getPaymentRequestsForOperator);
  app2.patch("/api/operator/:operatorId/payments/:requestId/process", requireOperatorAuth, operatorProcessPayment);
  app2.post("/telegram/webhook", handleWebhook);
  app2.get("/telegram/webhook", verifyWebhook);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/services/depositExpiration.ts
var expirationInterval = null;
var isRunning = false;
var EXPIRATION_CHECK_INTERVAL_MS = 30 * 1e3;
async function checkAndExpireDeposits() {
  if (isRunning) {
    log("Previous expiration check still running, skipping this interval");
    return 0;
  }
  isRunning = true;
  try {
    const expiredCount = await storage.expireOldDeposits();
    if (expiredCount > 0) {
      log(`\u2713 Expired ${expiredCount} deposit(s)`);
    }
    return expiredCount;
  } catch (error) {
    log(`Error expiring deposits: ${error instanceof Error ? error.message : error}`);
    return 0;
  } finally {
    isRunning = false;
  }
}
async function startDepositExpirationService() {
  log("Starting deposit expiration service...");
  await checkAndExpireDeposits();
  if (expirationInterval) {
    clearInterval(expirationInterval);
  }
  expirationInterval = setInterval(async () => {
    await checkAndExpireDeposits();
  }, EXPIRATION_CHECK_INTERVAL_MS);
  const intervalSeconds = EXPIRATION_CHECK_INTERVAL_MS / 1e3;
  log(`Deposit expiration service started. Checks every ${intervalSeconds} seconds.`);
}

// server/services/blockchainScanner.ts
var SCAN_INTERVAL_MS = 15 * 1e3;
var SCAN_WINDOW_MS = 2 * 60 * 1e3;
var MAX_EVENTS_PER_REQUEST = 200;
var scanInterval = null;
var isScanning = false;
var tronWeb;
var failedDeposits = [];
async function processTransferEvent(event) {
  try {
    const { transaction_id: txHash, result, block_timestamp } = event;
    if (!result || !result.to || !result.from || result.value === void 0) {
      return { success: true };
    }
    const toAddress = tronWeb.address.fromHex(result.to);
    const fromAddress = tronWeb.address.fromHex(result.from);
    const amount = convertFromSun(result.value);
    if (toAddress !== getMasterWalletAddress()) {
      return { success: true };
    }
    const existingDeposit = await storage.getDepositByTxHash(txHash);
    if (existingDeposit) {
      return { success: true };
    }
    const matchingDeposit = await storage.findPendingDepositByPayableAmount(amount);
    if (!matchingDeposit) {
      log(`\u26A0\uFE0F No matching deposit for transfer: ${amount} USDT from ${fromAddress} (tx: ${txHash})`);
      return { success: true };
    }
    const success = await storage.confirmDepositWithTransaction(
      matchingDeposit.id,
      txHash,
      amount
    );
    if (success) {
      log(`\u2713 Confirmed deposit ${matchingDeposit.id}: ${amount} USDT for user ${matchingDeposit.userId} (tx: ${txHash})`);
      return { success: true };
    } else {
      const error = `Failed to confirm deposit ${matchingDeposit.id} with tx ${txHash}`;
      log(`\u274C ${error}`);
      failedDeposits.push({
        depositId: matchingDeposit.id,
        txHash,
        amount,
        error: "Database transaction failed",
        timestamp: /* @__PURE__ */ new Date()
      });
      return { success: false, error };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    log(`\u274C Error processing transfer event: ${errorMsg}`);
    console.error("Full error details:", error);
    return { success: false, error: errorMsg };
  }
}
async function fetchEventsWithBlockRange(minTimestamp, maxTimestamp) {
  const allEvents = [];
  let fingerprint = null;
  let iterationCount = 0;
  const maxIterations = 50;
  try {
    do {
      const options = {
        only_confirmed: true,
        event_name: "Transfer",
        min_block_timestamp: minTimestamp,
        max_block_timestamp: maxTimestamp,
        order_by: "block_timestamp,asc",
        limit: MAX_EVENTS_PER_REQUEST
      };
      if (fingerprint) {
        options.fingerprint = fingerprint;
      }
      const response = await tronWeb.event.getEventsByContractAddress(
        getUsdtContractAddress(),
        options
      );
      if (!response.success || !response.data || response.data.length === 0) {
        break;
      }
      const relevantEvents = response.data.filter((event) => {
        if (!event.result || !event.result.to) {
          return false;
        }
        try {
          const toAddress = tronWeb.address.fromHex(event.result.to);
          return toAddress === getMasterWalletAddress();
        } catch {
          return false;
        }
      });
      allEvents.push(...relevantEvents);
      const lastEvent = response.data[response.data.length - 1];
      fingerprint = lastEvent._fingerprint || null;
      if (!fingerprint) {
        break;
      }
      iterationCount++;
      if (iterationCount >= maxIterations) {
        log(`\u26A0\uFE0F Reached max iterations (${maxIterations}) while fetching events`);
        break;
      }
    } while (fingerprint);
    return allEvents;
  } catch (error) {
    log(`Error fetching events with block range: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}
async function scanBlockchain() {
  if (isScanning) {
    log("Previous blockchain scan still running, skipping this interval");
    return;
  }
  isScanning = true;
  try {
    const currentBlock = await tronWeb.trx.getCurrentBlock();
    const currentBlockNumber = currentBlock.block_header?.raw_data?.number || 0;
    const currentBlockTimestamp = currentBlock.block_header?.raw_data?.timestamp || Date.now();
    let scanState = await storage.getTronScanState();
    if (!scanState) {
      const initialTimestamp = currentBlockTimestamp - SCAN_WINDOW_MS;
      scanState = await storage.createTronScanState({
        lastProcessedBlockNumber: (currentBlockNumber - 40).toString()
      });
      await storage.updateTronScanStateWithTimestamp(
        currentBlockNumber - 40,
        new Date(initialTimestamp)
      );
      scanState = await storage.getTronScanState();
      if (!scanState) {
        throw new Error("Failed to create scan state");
      }
    }
    const lastProcessedTimestamp = scanState.lastProcessedTimestamp?.getTime() || currentBlockTimestamp - SCAN_WINDOW_MS;
    const minTimestamp = lastProcessedTimestamp;
    const maxTimestamp = currentBlockTimestamp;
    if (maxTimestamp <= minTimestamp) {
      return;
    }
    log(`Scanning blocks from timestamp ${minTimestamp} to ${maxTimestamp}...`);
    const events = await fetchEventsWithBlockRange(minTimestamp, maxTimestamp);
    log(`Found ${events.length} USDT transfer(s) to master wallet in scan window`);
    let allSuccessful = true;
    const processedResults = [];
    for (const event of events) {
      const result = await processTransferEvent(event);
      processedResults.push(result);
      if (!result.success) {
        allSuccessful = false;
        log(`\u274C Failed to process event tx: ${event.transaction_id} - ${result.error}`);
      }
    }
    if (!allSuccessful) {
      const failedCount = processedResults.filter((r) => !r.success).length;
      log(`\u26A0\uFE0F WARNING: ${failedCount}/${events.length} events failed to process. Block number NOT advanced.`);
      log(`\u26A0\uFE0F Last processed block remains at ${scanState.lastProcessedBlockNumber}`);
      if (failedDeposits.length > 0) {
        log("\u274C FAILED DEPOSITS REQUIRING MANUAL REVIEW:");
        failedDeposits.slice(-10).forEach((fd) => {
          log(`   - Deposit ID: ${fd.depositId}, TX: ${fd.txHash}, Amount: ${fd.amount} USDT, Error: ${fd.error}`);
        });
      }
      return;
    }
    await storage.updateTronScanStateWithTimestamp(currentBlockNumber, new Date(currentBlockTimestamp));
    log(`\u2713 Successfully processed all ${events.length} events (including 0 events case), advanced to block ${currentBlockNumber}`);
  } catch (error) {
    if (error instanceof Error) {
      log(`\u274C Error scanning blockchain: ${error.message}`);
      console.error("Full blockchain scanner error:", error);
    } else {
      log(`\u274C Error scanning blockchain: ${error}`);
    }
    log(`\u26A0\uFE0F State NOT advanced due to error. Will retry on next scan.`);
  } finally {
    isScanning = false;
  }
}
async function startBlockchainScanner() {
  log("Starting TRON blockchain scanner...");
  tronWeb = initializeTronWeb();
  await scanBlockchain();
  if (scanInterval) {
    clearInterval(scanInterval);
  }
  scanInterval = setInterval(async () => {
    await scanBlockchain();
  }, SCAN_INTERVAL_MS);
  const intervalSeconds = SCAN_INTERVAL_MS / 1e3;
  log(`Blockchain scanner started. Scans every ${intervalSeconds} seconds.`);
}

// server/index.ts
var app = express2();
app.use(express2.json({
  limit: "50mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express2.urlencoded({ limit: "50mb", extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, async () => {
    log(`serving on port ${port}`);
    try {
      log("Starting exchange rate service...");
      await startExchangeRateService();
      log("Exchange rate service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize exchange rate service:", error);
    }
    try {
      log("Starting deposit expiration service...");
      await startDepositExpirationService();
      log("Deposit expiration service initialized successfully");
    } catch (error) {
      console.error("Failed to initialize deposit expiration service:", error);
    }
    try {
      log("Starting TRON blockchain scanner...");
      await startBlockchainScanner();
      log("Blockchain scanner initialized successfully");
    } catch (error) {
      console.error("Failed to initialize blockchain scanner:", error);
    }
    if (process.env.BOT_TOKEN) {
      try {
        log("Initializing Telegram bot...");
        initializeBot(process.env.BOT_TOKEN);
        const webAppUrl = process.env.WEBAPP_URL || (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : `http://localhost:${port}`);
        log(`WebApp URL: ${webAppUrl}`);
        await setupMenuButton(webAppUrl);
        if (process.env.NODE_ENV === "production" && process.env.REPLIT_DOMAINS) {
          const webhookUrl = `https://${process.env.REPLIT_DOMAINS.split(",")[0]}/telegram/webhook`;
          await setupWebhook(webhookUrl);
          log(`Telegram webhook set to: ${webhookUrl}`);
        }
        log("Telegram bot initialized successfully");
      } catch (error) {
        console.error("Failed to initialize Telegram bot:", error);
      }
    } else {
      log("BOT_TOKEN not set, Telegram bot will not be initialized");
    }
  });
})();
