import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    telegramId: null,
    telegramUsername: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Ad Events API", () => {
  it("should record an impression event", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adEvents.recordEvent({
      eventType: "impression",
      telegramId: "test_user_123",
      zoneId: "10269314",
      userAgent: "Mozilla/5.0 Test",
    });

    expect(result.success).toBe(true);
  });

  it("should record a click event", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adEvents.recordEvent({
      eventType: "click",
      telegramId: "test_user_123",
      zoneId: "10269314",
      clickId: "test_click_123",
      userAgent: "Mozilla/5.0 Test",
    });

    expect(result.success).toBe(true);
  });

  it("should retrieve events by telegram ID", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // First, record an event
    await caller.adEvents.recordEvent({
      eventType: "impression",
      telegramId: "test_user_456",
      zoneId: "10269314",
    });

    // Then retrieve it
    const events = await caller.adEvents.getByTelegramId({
      telegramId: "test_user_456",
      limit: 10,
    });

    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0]?.telegramId).toBe("test_user_456");
  });

  it("should get event statistics", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.adEvents.getStats();

    expect(stats).toHaveProperty("totalImpressions");
    expect(stats).toHaveProperty("totalClicks");
    expect(stats).toHaveProperty("uniqueUsers");
    expect(typeof stats.totalImpressions).toBe("number");
    expect(typeof stats.totalClicks).toBe("number");
    expect(typeof stats.uniqueUsers).toBe("number");
  });

  it("should retrieve all events with limit", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const events = await caller.adEvents.getAll({ limit: 5 });

    expect(Array.isArray(events)).toBe(true);
    expect(events.length).toBeLessThanOrEqual(5);
  });
});

describe("Ad Zones API", () => {
  it("should create a new ad zone", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.adZones.create({
      zoneId: "test_zone_" + Date.now(),
      zoneName: "Test Zone",
      zoneType: "banner",
    });

    expect(result.success).toBe(true);
  });

  it("should retrieve all ad zones", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const zones = await caller.adZones.getAll();

    expect(Array.isArray(zones)).toBe(true);
  });

  it("should retrieve zone by ID", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const zoneId = "test_zone_" + Date.now();

    // Create zone first
    await caller.adZones.create({
      zoneId,
      zoneName: "Test Zone for Retrieval",
    });

    // Retrieve it
    const zone = await caller.adZones.getById({ zoneId });

    expect(zone).toBeDefined();
    expect(zone?.zoneId).toBe(zoneId);
  });

  it("should update zone status", async () => {
    const { ctx } = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const zoneId = "test_zone_" + Date.now();

    // Create zone
    await caller.adZones.create({
      zoneId,
      zoneName: "Test Zone for Status Update",
    });

    // Update status
    const result = await caller.adZones.updateStatus({
      zoneId,
      isActive: false,
    });

    expect(result.success).toBe(true);

    // Verify update
    const zone = await caller.adZones.getById({ zoneId });
    expect(zone?.isActive).toBe(false);
  });
});

describe("Database Functions", () => {
  it("should create and retrieve ad event", async () => {
    const eventData = {
      eventType: "impression" as const,
      telegramId: "db_test_user",
      zoneId: "10269314",
      userAgent: "Test Agent",
    };

    await db.createAdEvent(eventData);

    const events = await db.getAdEventsByTelegramId("db_test_user", 1);

    expect(events.length).toBeGreaterThan(0);
    expect(events[0]?.telegramId).toBe("db_test_user");
  });

  it("should get events by zone", async () => {
    const zoneId = "test_zone_db_" + Date.now();

    await db.createAdEvent({
      eventType: "click",
      telegramId: "test_user",
      zoneId,
    });

    const events = await db.getAdEventsByZone(zoneId, 10);

    expect(Array.isArray(events)).toBe(true);
  });

  it("should calculate statistics correctly", async () => {
    const stats = await db.getAdEventStats();

    expect(stats).toHaveProperty("totalImpressions");
    expect(stats).toHaveProperty("totalClicks");
    expect(stats).toHaveProperty("uniqueUsers");
  });
});
