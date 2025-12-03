import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, adEvents, InsertAdEvent, adZones, InsertAdZone } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "telegramId", "telegramUsername"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Ad Events functions
export async function createAdEvent(event: InsertAdEvent) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(adEvents).values(event);
  return result;
}

export async function getAdEventsByTelegramId(telegramId: string, limit = 100) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(adEvents)
    .where(eq(adEvents.telegramId, telegramId))
    .orderBy(desc(adEvents.createdAt))
    .limit(limit);
}

export async function getAdEventsByZone(zoneId: string, limit = 100) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(adEvents)
    .where(eq(adEvents.zoneId, zoneId))
    .orderBy(desc(adEvents.createdAt))
    .limit(limit);
}

export async function getAllAdEvents(limit = 100) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(adEvents)
    .orderBy(desc(adEvents.createdAt))
    .limit(limit);
}

export async function getAdEventStats() {
  const db = await getDb();
  if (!db) {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      uniqueUsers: 0,
    };
  }

  const stats = await db
    .select({
      totalImpressions: sql<number>`COUNT(CASE WHEN ${adEvents.eventType} = 'impression' THEN 1 END)`,
      totalClicks: sql<number>`COUNT(CASE WHEN ${adEvents.eventType} = 'click' THEN 1 END)`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${adEvents.telegramId})`,
    })
    .from(adEvents);

  return stats[0] || {
    totalImpressions: 0,
    totalClicks: 0,
    uniqueUsers: 0,
  };
}

export async function getAdEventsByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(adEvents)
    .where(
      and(
        sql`${adEvents.createdAt} >= ${startDate}`,
        sql`${adEvents.createdAt} <= ${endDate}`
      )
    )
    .orderBy(desc(adEvents.createdAt));
}

// Ad Zones functions
export async function createAdZone(zone: InsertAdZone) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(adZones).values(zone);
  return result;
}

export async function getAdZoneByZoneId(zoneId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db
    .select()
    .from(adZones)
    .where(eq(adZones.zoneId, zoneId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllAdZones() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db.select().from(adZones).orderBy(desc(adZones.createdAt));
}

export async function updateAdZoneStatus(zoneId: string, isActive: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(adZones)
    .set({ isActive })
    .where(eq(adZones.zoneId, zoneId));
}
