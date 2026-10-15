export type SocialNetworkId = "linkedin" | "github" | "youtube";

export type SocialLink = {
  id: SocialNetworkId;
  // Accessible name — the links are shown as logos, not text.
  label: string;
  href: string;
};

export const CV_URL = "/Vanessa_Trejo_CV.pdf";

export const CONTACT_EMAIL = "contacto@vanessaltrejo.com";

export const socialLinks: SocialLink[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/vanessaltrejo/",
  },
  { id: "github", label: "GitHub", href: "https://github.com/vanessaltrejo" },
  {
    id: "youtube",
    label: "YouTube",
    href: "https://www.youtube.com/@vanessaltrejo",
  },
];
