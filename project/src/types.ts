export type Severity = 'low' | 'medium' | 'high';

export interface PotholeType {
  id: number;
  image: string;
  location: string;
  date: Date;
  severity: Severity;
  description: string;
  resolved?: boolean;
}