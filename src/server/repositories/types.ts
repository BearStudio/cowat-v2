export type StopCreateInput = {
  order: number;
  outwardTime: string;
  inwardTime?: string | null;
  locationId: string;
};
