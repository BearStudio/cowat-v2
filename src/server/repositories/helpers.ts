import type { Prisma } from '@/server/db/generated/client';

// ── User selects ─────────────────────────────────────────────────────────────

/** id, name, email — used for notification payloads */
const userSummarySelect = {
  id: true,
  name: true,
  email: true,
} satisfies Prisma.UserSelect;

/** id, name, image, phone — used for commute/passenger cards */
export const userProfileSelect = {
  id: true,
  name: true,
  image: true,
  phone: true,
} satisfies Prisma.UserSelect;

/** id, name, email, image — used for member lists */
export const userCardSelect = {
  ...userSummarySelect,
  image: true,
} satisfies Prisma.UserSelect;

// ── Location selects ─────────────────────────────────────────────────────────

export const locationSummarySelect = {
  id: true,
  name: true,
  address: true,
} satisfies Prisma.LocationSelect;

// ── Notification preferences ─────────────────────────────────────────────────

/** Pre-filtered to disabled channels — used to know which channels to skip */
const disabledChannelsInclude = {
  notificationPreferences: {
    where: { enabled: false },
    select: { channel: true },
  },
} satisfies Prisma.MemberInclude;

// ── Composite includes ───────────────────────────────────────────────────────

/** Member with disabled channels + user summary — used for notification targets */
export const memberNotificationInclude = {
  ...disabledChannelsInclude,
  user: { select: userSummarySelect },
} satisfies Prisma.MemberInclude;

/** Member → user with profile fields (image, phone) */
const memberWithUserProfileInclude = {
  user: { select: userProfileSelect },
} satisfies Prisma.MemberInclude;

/** Stops ordered by position with location summary */
export const stopsWithLocationInclude = {
  orderBy: { order: 'asc' as const },
  include: {
    location: { select: locationSummarySelect },
  },
} as const;

/** Enriched stops: ordered, with location + passengers and their user profiles */
const stopsWithPassengersInclude = {
  orderBy: { order: 'asc' as const },
  include: {
    location: { select: locationSummarySelect },
    passengers: {
      include: {
        passenger: {
          include: memberWithUserProfileInclude,
        },
      },
    },
  },
} as const;

/** Full commute include: driver profile + enriched stops with passengers */
export const enrichedCommuteInclude = {
  driver: {
    include: memberWithUserProfileInclude,
  },
  stops: stopsWithPassengersInclude,
} as const;

export type EnrichedCommute = Prisma.CommuteGetPayload<{
  include: typeof enrichedCommuteInclude;
}>;

export function flattenEnrichedCommute(c: EnrichedCommute) {
  return {
    ...c,
    driver: c.driver.user,
    stops: c.stops.map((s) => ({
      ...s,
      passengers: s.passengers.map((p) => ({
        ...p,
        passenger: p.passenger.user,
      })),
    })),
  };
}
