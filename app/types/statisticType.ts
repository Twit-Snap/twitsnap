export interface InteractionAmountData {
  dateName: string;
  date: string;
  amount: number;
}

export type StatisticsParams = {
  type: string;
  username: string | undefined;
  dateRange: string;
};
