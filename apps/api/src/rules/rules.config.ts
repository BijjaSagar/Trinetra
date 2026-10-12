/**
 * Starting thresholds from the product spec. Comparisons are strict:
 * "more than" means greater than, "below" means less than.
 */
export const rulesConfig = {
  crude: {
    watchAbove7dPct: 5,
    stockUpAbove7dPct: 10,
    windowDays: 7,
    slackDays: 3,
  },
  usdInr: {
    watchAbove30dPct: 2,
    windowDays: 30,
    slackDays: 5,
  },
  fao: {
    stockUpAboveMonthPct: 3,
    windowDays: 28,
    slackDays: 10,
  },
  ujani: {
    watchBelowPct: 40,
    stockUpBelowPct: 25,
    watchMonth: 10,
  },
  metals: {
    watchAbove7dPct: 3,
    windowDays: 7,
    slackDays: 3,
  },
  householdBufferWeeks: { min: 2, max: 4 },
} as const;
