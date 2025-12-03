import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Ad Events tracking
  adEvents: router({
    // Public endpoint for Monetag postback
    recordEvent: publicProcedure
      .input(
        z.object({
          eventType: z.enum(["impression", "click"]),
          telegramId: z.string().optional(),
          zoneId: z.string(),
          clickId: z.string().optional(),
          subId: z.string().optional(),
          revenue: z.string().optional(),
          currency: z.string().optional(),
          userAgent: z.string().optional(),
          ipAddress: z.string().optional(),
          country: z.string().optional(),
          rawData: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.createAdEvent({
            eventType: input.eventType,
            telegramId: input.telegramId || null,
            zoneId: input.zoneId,
            clickId: input.clickId || null,
            subId: input.subId || null,
            revenue: input.revenue || null,
            currency: input.currency || null,
            userAgent: input.userAgent || null,
            ipAddress: input.ipAddress || null,
            country: input.country || null,
            rawData: input.rawData || null,
          });

          return { success: true };
        } catch (error) {
          console.error("Failed to record ad event:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to record event",
          });
        }
      }),

    // Get events by telegram ID
    getByTelegramId: publicProcedure
      .input(
        z.object({
          telegramId: z.string(),
          limit: z.number().optional().default(100),
        })
      )
      .query(async ({ input }) => {
        return await db.getAdEventsByTelegramId(input.telegramId, input.limit);
      }),

    // Get all events (protected - admin only)
    getAll: protectedProcedure
      .input(
        z.object({
          limit: z.number().optional().default(100),
        })
      )
      .query(async ({ input }) => {
        return await db.getAllAdEvents(input.limit);
      }),

    // Get events by zone
    getByZone: protectedProcedure
      .input(
        z.object({
          zoneId: z.string(),
          limit: z.number().optional().default(100),
        })
      )
      .query(async ({ input }) => {
        return await db.getAdEventsByZone(input.zoneId, input.limit);
      }),

    // Get statistics
    getStats: publicProcedure.query(async () => {
      return await db.getAdEventStats();
    }),

    // Get events by date range
    getByDateRange: protectedProcedure
      .input(
        z.object({
          startDate: z.date(),
          endDate: z.date(),
        })
      )
      .query(async ({ input }) => {
        return await db.getAdEventsByDateRange(input.startDate, input.endDate);
      }),
  }),

  // Ad Zones management
  adZones: router({
    // Create new zone
    create: protectedProcedure
      .input(
        z.object({
          zoneId: z.string(),
          zoneName: z.string().optional(),
          zoneType: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.createAdZone({
            zoneId: input.zoneId,
            zoneName: input.zoneName || null,
            zoneType: input.zoneType || null,
          });

          return { success: true };
        } catch (error) {
          console.error("Failed to create ad zone:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create zone",
          });
        }
      }),

    // Get zone by ID
    getById: publicProcedure
      .input(z.object({ zoneId: z.string() }))
      .query(async ({ input }) => {
        return await db.getAdZoneByZoneId(input.zoneId);
      }),

    // Get all zones
    getAll: publicProcedure.query(async () => {
      return await db.getAllAdZones();
    }),

    // Update zone status
    updateStatus: protectedProcedure
      .input(
        z.object({
          zoneId: z.string(),
          isActive: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.updateAdZoneStatus(input.zoneId, input.isActive);
          return { success: true };
        } catch (error) {
          console.error("Failed to update zone status:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update zone status",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
