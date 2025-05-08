export interface PrimaryInsured {
  name: string;
}

export interface Insured {
  internalId: string;
  name: string;
}

export interface InsuranceMatch {
  insured: Insured;
  score: number;
  isManual?: boolean;
}
