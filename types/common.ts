export interface SelectOption {
  label: string;
  value: string | number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface StatusPayload {
  status: string | number;
  reject_reason_id?: number;
  reject_reason?: string;
}
