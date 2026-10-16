export type ExperienceKind = "internship" | "freelance";

// One job: a professional internship or a freelance engagement.
export type ExperienceEntry = {
  id: string;
  kind: ExperienceKind;
  dateRange: string;
  role: string;
  organization: string;
  location: string;
  description: string;
};

// A hackathon: a 24-48 hour challenge that ended in a prototype.
export type Hackathon = {
  id: string;
  name: string;
  organizer: string;
  year: string;
  // How it ended, e.g. "Finalista".
  result: string;
  // Missing while the real screenshot doesn't exist yet — the floating
  // preview shows a neutral block in its place.
  previewImage?: string;
  // Only set once the real page exists — the row links out when present.
  url?: string;
};

export type PartnerCompany = {
  id: string;
  name: string;
  // Missing while the real logo doesn't exist yet — a neutral block with the
  // name takes its place.
  logo?: string;
};

export type ExperienceData = {
  // Newest first: the timeline reads from top to bottom.
  experience: ExperienceEntry[];
  hackathons: Hackathon[];
  companies: PartnerCompany[];
};
