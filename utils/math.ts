
import { AmortizationRow, AppState, CalculationResult, Milestone, InvestmentType } from '../types';

/**
 * High-precision financial engine
 */
export const calculateFinance = (state: AppState): CalculationResult => {
  const {
    principal,
    annualRate,
    tenureYears,
    monthlyContribution,
    investmentType,
    injectionRules
  } = state;

  const totalMonths = tenureYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  const amortization: AmortizationRow[] = [];
  
  let currentBalance = principal;
  let totalInvested = principal;
  let totalInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
    const openingBalance = currentBalance;
    
    // 1. Calculate Base Contribution (SIP or EMI)
    let baseContribution = 0;
    if (investmentType === InvestmentType.SIP || investmentType === InvestmentType.LUMPSUM_SIP) {
      baseContribution = monthlyContribution;
    } else if (investmentType === InvestmentType.LOAN_STANDARD || investmentType === InvestmentType.LOAN_PREPAYMENT) {
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      baseContribution = -emi; 
    } else if (investmentType === InvestmentType.IRREGULAR_ONLY) {
      baseContribution = 0; // Transparently zero out SIP
    }

    // 2. Calculate Rule Contribution (Strategic Injections)
    let ruleContribution = 0;
    for (const rule of injectionRules) {
      if (m >= rule.startMonth && m <= rule.endMonth) {
        ruleContribution += rule.amount;
      }
    }

    const totalContribution = baseContribution + ruleContribution;

    // 3. Investment logic
    let interestAccrued = 0;
    if (investmentType === InvestmentType.SIMPLE) {
      interestAccrued = principal * monthlyRate;
    } else {
      interestAccrued = currentBalance * monthlyRate;
    }

    currentBalance = openingBalance + totalContribution + interestAccrued;
    totalInterest += interestAccrued;

    if (totalContribution > 0) {
      totalInvested += totalContribution;
    }

    amortization.push({
      month: m,
      openingBalance,
      baseContribution,
      ruleContribution,
      contribution: totalContribution,
      interest: interestAccrued,
      closingBalance: Math.max(0, currentBalance),
      totalInvested
    });

    if (currentBalance <= 0 && (investmentType === InvestmentType.LOAN_STANDARD || investmentType === InvestmentType.LOAN_PREPAYMENT)) break;
  }

  const milestones: Milestone[] = [];
  const multiples = [2, 3, 5];
  multiples.forEach(mult => {
    const target = principal * mult;
    const mRow = amortization.find(a => a.closingBalance >= target);
    if (mRow) {
      milestones.push({
        label: `${mult}x Principal`,
        month: mRow.month,
        preciseYear: mRow.month / 12,
        ruleOf72: mult === 2 ? `Rule of 72 suggests ~${(72 / annualRate).toFixed(1)} years` : undefined
      });
    }
  });

  return {
    totalInvested,
    totalInterest,
    maturityValue: Math.max(0, currentBalance),
    amortization,
    milestones
  };
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

export const calculateInflationAdjusted = (value: number, inflation: number, years: number) => {
  return value / Math.pow(1 + (inflation / 100), years);
};
