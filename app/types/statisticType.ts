export interface InteractionAmountData {
  dateName: string;
  date: string;
  amount: number;
}

export interface AccountInteractionData {
  total: number;
  follows: InteractionAmountData[];
}

export type StatisticsParams = {
  type: string;
  username: string | undefined;
  dateRange: string;
};
