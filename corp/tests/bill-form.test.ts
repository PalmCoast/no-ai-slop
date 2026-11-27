import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (p: string) => readFileSync(join(root, p), "utf8");

describe("AI-bill form (B2B invoice swap 2026-11-27)", () => {
  it("declares the real and test forms for Netlify detection", () => {
    const forms = read("public/__forms.html");
    expect(forms).toMatch(/<form name="ai-bill" data-netlify="true"[^>]*enctype="multipart\/form-data"/);
    expect(forms).toMatch(/<form name="ai-bill-test" data-netlify="true"[^>]*enctype="multipart\/form-data"/);
    for (const field of ["email", "bill", "nda", "is_test", "from", "bot-field"]) expect(forms).toContain(`name="${field}"`);
    expect(forms).not.toContain('name="mission"');
  });
  it("keeps the visible form to email, file and a required NDA box, and routes tests away from the real form", () => {
    const src = read("src/components/BillForm.tsx");
    expect(src.match(/<input type="(email|file|checkbox)"/g)).toEqual(['<input type="email"', '<input type="file"', '<input type="checkbox"']);
    expect(src).toMatch(/name="nda" value="yes" required/);
    expect(src).toContain('get("formtest") === "1"');
    expect(src).toContain('email.endsWith("@agentmail.to")');
    expect(src).toContain('data.set("form-name", "ai-bill-test")');
    expect(src).toContain('"bill_form_submit"');
  });
  it("shows the form next to the triage CTA on home and /consult", () => {
    expect(read("src/pages/Home.tsx")).toContain('<BillForm from="home-hero" />');
    expect(read("src/pages/Consult.tsx")).toContain('<BillForm from="consult-hero" />');
  });
});
