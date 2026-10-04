import { BRAND_NAME, BRAND_URL, DANIEL_LINKEDIN_URL, LEGAL_NAME } from "./brand.ts";

/** Verified bio facts only. Do not add employers, degrees, or certifications here. */
export const DANIEL_NAME = "Daniel Graham";
export const DANIEL_JOB_TITLE = `Founder, ${BRAND_NAME}`;
export const DANIEL_URL = `${BRAND_URL}/about`;
export const DANIEL_ID = `${DANIEL_URL}#daniel-graham`;
export const DANIEL_BIO = `${DANIEL_NAME} is the founder of ${BRAND_NAME} (${LEGAL_NAME}) in Palm Coast, Florida. He has 25 years in enterprise IT and telecom.`;
export const DANIEL_SAME_AS = [DANIEL_LINKEDIN_URL] as const;
