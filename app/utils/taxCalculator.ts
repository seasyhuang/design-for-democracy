// 2024 Combined Federal + Québec Marginal Tax Rates
// Source: https://www.wealthsimple.com/en-ca/tool/tax-calculator/quebec

export interface TaxBracket {
  minIncome: number;
  maxIncome: number | null; // null means no upper limit
  rate: number;
  description: string;
}

export interface TaxBreakdown {
  totalTax: number;
  brackets: {
    bracket: TaxBracket;
    taxableAmount: number;
    taxAmount: number;
  }[];
}

// 2024 Federal + Québec combined marginal tax rates
const TAX_BRACKETS: TaxBracket[] = [
  {
    minIncome: 0,
    maxIncome: 51446,
    rate: 0.28,
    description: "15% Federal + 13% Québec"
  },
  {
    minIncome: 51446,
    maxIncome: 102894,
    rate: 0.37,
    description: "20.5% Federal + 16.5% Québec"
  },
  {
    minIncome: 102894,
    maxIncome: 165430,
    rate: 0.41,
    description: "26% Federal + 15% Québec"
  },
  {
    minIncome: 165430,
    maxIncome: 235675,
    rate: 0.46,
    description: "29% Federal + 17% Québec"
  },
  {
    minIncome: 235675,
    maxIncome: null,
    rate: 0.53,
    description: "33% Federal + 20% Québec"
  }
];

/**
 * Calculate estimated taxes for a given income using 2024 Québec marginal tax rates
 * @param income - Annual income in dollars
 * @returns Tax breakdown with total tax and breakdown by bracket
 */
export function calculateTaxes(income: number): TaxBreakdown {
  if (income <= 0) {
    return {
      totalTax: 0,
      brackets: []
    };
  }

  const brackets: TaxBreakdown['brackets'] = [];
  let totalTax = 0;

  for (const bracket of TAX_BRACKETS) {
    // Calculate how much income falls into this bracket
    const bracketMin = bracket.minIncome;
    const bracketMax = bracket.maxIncome;
    
    // If income is below this bracket's minimum, skip
    if (income <= bracketMin) {
      break;
    }

    // Calculate taxable amount in this bracket
    let taxableAmount: number;
    if (bracketMax === null) {
      // No upper limit (top bracket)
      taxableAmount = income - bracketMin;
    } else {
      // Has upper limit
      taxableAmount = Math.min(income, bracketMax) - bracketMin;
    }

    // Calculate tax for this bracket
    const taxAmount = taxableAmount * bracket.rate;
    totalTax += taxAmount;

    brackets.push({
      bracket,
      taxableAmount,
      taxAmount
    });
  }

  return {
    totalTax: Math.round(totalTax), // Round to nearest dollar
    brackets
  };
}

/**
 * Get a simplified tax breakdown for display purposes
 * @param income - Annual income in dollars
 * @returns Simplified breakdown with total tax and effective rate
 */
export function getTaxSummary(income: number) {
  if (income <= 0) {
    return {
      totalTax: 0,
      effectiveRate: 0,
      netIncome: 0
    };
  }

  const breakdown = calculateTaxes(income);
  const effectiveRate = (breakdown.totalTax / income) * 100;
  const netIncome = income - breakdown.totalTax;

  return {
    totalTax: breakdown.totalTax,
    effectiveRate: Math.round(effectiveRate * 100) / 100, // Round to 2 decimal places
    netIncome: Math.round(netIncome)
  };
}

/**
 * Format currency for display
 * @param amount - Amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get example calculations for common income levels
 */
export function getExampleCalculations() {
  const examples = [30000, 50000, 75000, 100000, 150000, 200000];
  
  return examples.map(income => ({
    income,
    ...getTaxSummary(income)
  }));
} 