import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with Telegram-specific fields for Mini App integration.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Telegram-specific fields
  telegramId: varchar("telegramId", { length: 64 }),
  telegramUsername: varchar("telegramUsername", { length: 255 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

/**
 * Monetag ad zones configuration
 * Stores zone IDs and their settings
 */
export const adZones = mysqlTable("ad_zones", {
  id: int("id").autoincrement().primaryKey(),
  zoneId: varchar("zoneId", { length: 64 }).notNull().unique(),
  zoneName: varchar("zoneName", { length: 255 }),
  zoneType: varchar("zoneType", { length: 64 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Ad events tracking table
 * Records all impressions and clicks from Monetag ads
 */
export const adEvents = mysqlTable("ad_events", {
  id: int("id").autoincrement().primaryKey(),
  
  // Event identification
  eventType: mysqlEnum("eventType", ["impression", "click"]).notNull(),
  eventId: varchar("eventId", { length: 255 }),
  
  // User identification
  userId: int("userId"),
  telegramId: varchar("telegramId", { length: 64 }),
  
  // Ad zone information
  zoneId: varchar("zoneId", { length: 64 }).notNull(),
  
  // Monetag postback data
  clickId: varchar("clickId", { length: 255 }),
  subId: varchar("subId", { length: 255 }),
  subId2: varchar("subId2", { length: 255 }),
  revenue: varchar("revenue", { length: 64 }),
  currency: varchar("currency", { length: 10 }),
  
  // Device and location info
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  country: varchar("country", { length: 2 }),
  
  // Metadata
  rawData: text("rawData"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type AdZone = typeof adZones.$inferSelect;
export type InsertAdZone = typeof adZones.$inferInsert;

export type AdEvent = typeof adEvents.$inferSelect;
export type InsertAdEvent = typeof adEvents.$inferInsert;
