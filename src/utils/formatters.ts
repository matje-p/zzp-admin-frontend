/**
 * Formatting utilities for currency, dates, and other display values
 */

export const formatCurrency = (amount: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
  }).format(amount);
};

export const formatCurrencyAbs = (amount: number, currency: string = "EUR"): string => {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency,
  }).format(Math.abs(amount));
};

export const formatDate = (dateString: string | null): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatPeriod = (
  startDate: string | null,
  endDate: string | null
): string => {
  if (!startDate || !endDate) {
    return "-";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const startDay = start.getDate();
  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const endDay = end.getDate();
  const endMonth = end.toLocaleString("en-US", { month: "short" });
  const endYear = end.getFullYear();

  // Format: "5 Jul to 5 Aug 2025"
  if (
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear()
  ) {
    // Same month and year: "5 to 15 Jul 2025"
    return `${startDay} to ${endDay} ${endMonth} ${endYear}`;
  } else if (start.getFullYear() === end.getFullYear()) {
    // Same year but different months: "5 Jul to 5 Aug 2025"
    return `${startDay} ${startMonth} to ${endDay} ${endMonth} ${endYear}`;
  } else {
    // Different years: "5 Jul 2024 to 5 Aug 2025"
    const startYear = start.getFullYear();
    return `${startDay} ${startMonth} ${startYear} to ${endDay} ${endMonth} ${endYear}`;
  }
};

export const formatAmountInput = (value: number): string => {
  if (!value && value !== 0) return "";
  // Format with thousands separator and 2 decimals
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseAmountInput = (value: string): number => {
  // Remove thousands separators and parse
  const cleaned = value.replace(/,/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const truncateDescription = (
  description: string | null,
  maxLength: number = 40
): string => {
  if (!description) return "-";
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + "...";
};

export const formatBillingCycle = (cycle: string): string => {
  const cycleMap: Record<string, string> = {
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'yearly': 'Yearly',
    'annual': 'Annual',
    'weekly': 'Weekly',
    'biweekly': 'Biweekly',
  };
  return cycleMap[cycle.toLowerCase()] || cycle;
};
