
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
  IRREGULAR_ONLY = 'IRREGULAR_ONLY', // New: Only uses injection rules
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

export interface AmortizationRow {
  month: number;
  openingBalance: number;
  baseContribution: number; // Regular SIP or EMI
  ruleContribution: number; // Strategic Injections
  contribution: number;     // Total sum
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

export interface CalculationResult {
  totalInvested: number;
  totalInterest: number;
  maturityValue: number;
  amortization: AmortizationRow[];
  milestones: Milestone[];
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

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  scenarios: Scenario[];
  createdAt: number;
}

export type AuthView = 'LOGIN' | 'SIGNUP' | 'FORGOT';
