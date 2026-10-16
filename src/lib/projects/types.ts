export type Project = {
  id: string;
  title: string;
  dateRange: string;
  description: string;
  tags: string[];
  // Missing while the real screenshot doesn't exist yet — the card shows a
  // neutral block in its place.
  previewImage?: string;
  // Screenshot of the phone view, same idea: the phone frame stays empty
  // until it exists.
  mobileImage?: string;
  // Only set once the real repo/demo exists — the card links out when present.
  sourceUrl?: string;
};
