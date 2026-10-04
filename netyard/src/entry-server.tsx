import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

const report = console.error;
console.error = (...args: unknown[]) => {
  const text = args.map((arg) => (typeof arg === "string" ? arg : "")).join(" ");
  if (text.includes("useLayoutEffect does nothing on the server")) return;
  report(...args);
};

export function render(url: string): string {
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  );
}
