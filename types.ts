
export enum CalculatorMode {
  BASIC_SAVINGS = 'BASIC_SAVINGS',
  WEALTH_BUILDING = 'WEALTH_BUILDING',
  LOAN_MANAGEMENT = 'LOAN_MANAGEMENT'
}

export enum InvestmentType {
  SIMPLE = 'SIMPLE',
  COMPOUND = 'COMPOUND',
  SIP = 'SIP',
  LUMPSUM_SIP = 'LUMPSUM_SIP',
  IRREGULAR_SIP = 'IRREGULAR_SIP',
  LOAN_STANDARD = 'LOAN_STANDARD',
  LOAN_PREPAYMENT = 'LOAN_PREPAYMENT'
}

export enum CompoundFrequency {
  ANNUALLY = 1,
  QUARTERLY = 4,
  MONTHLY = 12
}

export interface InjectionRule {
  id: string;
  amount: number;
  startMonth: number;
  endMonth: number;
}

export interface CalculationResult {
  totalInvested: number;
  totalInterest: number;
  maturityValue: number;
  amortization: AmortizationRow[];
  milestones: Milestone[];
}

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  contribution: number;
  interest: number;
  closingBalance: number;
  totalInvested: number;
}

export interface Milestone {
  label: string;
  month: number;
  preciseYear: number;
  ruleOf72?: string;
}

export interface AppState {
  mode: CalculatorMode;
  investmentType: InvestmentType;
  principal: number;
  annualRate: number;
  tenureYears: number;
  monthlyContribution: number;
  compoundFrequency: CompoundFrequency;
  injectionRules: InjectionRule[];
  inflationRate: number;
  taxRate: number;
  loanPrepaymentStrategy: 'REDUCE_EMI' | 'REDUCE_TENURE';
  taxEnabled: boolean;
  inflationEnabled: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  state: AppState;
  result: CalculationResult;
  timestamp: number;
}
