// Elements carrying these props turn the site's custom cursor from a dot
// into a ring with an arrow while the pointer is over them. Kept in a plain
// module (not next to the client component) so server components can spread
// it too.
export const cursorProjectProps = { "data-cursor": "project" } as const;

export const CURSOR_PROJECT_SELECTOR = '[data-cursor="project"]';
