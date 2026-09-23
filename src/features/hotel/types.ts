import type { ClassifiedOperationalSnapshot } from "./operational-snapshot";

export type HotelRoomItem = {
  id: string;
  roomNumber: number;
  title: string;
  roomType: string | null;
  maxCapacity: number | null;
  kitchenType: string | null;
  verifiedStatus: string;
  lastReviewed: string | null;
  freshness: string;
  room360Key: string;
};

export type HotelSourceState = {
  status: "fresh" | "stale" | "empty";
  latestAt: string | null;
};

export type HotelDirectoryData = {
  rooms: HotelRoomItem[];
  source: HotelSourceState;
  operational: ClassifiedOperationalSnapshot;
};
