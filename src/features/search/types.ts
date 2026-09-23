export type SearchEntityType = "room" | "project" | "knowledge";

export type SearchResult = {
  entityType: SearchEntityType;
  id: string;
  title: string;
  subtitle: string | null;
  href: string | null;
  freshness: string | null;
};
