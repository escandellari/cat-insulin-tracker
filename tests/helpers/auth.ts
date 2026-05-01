import { renderToStaticMarkup } from "react-dom/server";

/** A minimal Auth.js v5 session for "Jane Doe" */
export const AUTHED_SESSION = {
  user: { id: "user-1", name: "Jane Doe", email: "jane@example.com" },
  expires: new Date(Date.now() + 86400000).toISOString(),
} as const;

/** Render a React element (e.g. a server-component return value) to HTML. */
export function toHtml(jsx: React.ReactElement): string {
  return renderToStaticMarkup(jsx);
}
