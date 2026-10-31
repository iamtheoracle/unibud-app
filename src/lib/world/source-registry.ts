/**
 * Curated primary-source entry points for Nigerian higher education.
 * Inclusion identifies an official source domain, not automatic approval of
 * every item hosted there. Every individual story still needs review.
 */
export type TrustedSource = {
  id: string;
  name: string;
  url: string;
  scope: string[];
  authority: "primary";
  country: "NG";
  verifiedAt: string;
};

export const TRUSTED_NIGERIAN_EDUCATION_SOURCES: TrustedSource[] = [
  { id: "fme", name: "Federal Ministry of Education", url: "https://education.gov.ng/", scope: ["national-policy", "scholarships", "education-news", "official-agencies"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "nuc", name: "National Universities Commission", url: "https://www.nuc.edu.ng/", scope: ["universities", "accreditation", "university-programmes", "quality-assurance"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "enuc", name: "Electronic National Universities Commission", url: "https://enuc.nuc.edu.ng/", scope: ["university-directory", "programmes", "academic-information"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "jamb", name: "Joint Admissions and Matriculation Board", url: "https://www.jamb.gov.ng/", scope: ["admissions", "utme", "caps", "registration"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "nelfund", name: "Nigeria Education Loan Fund", url: "https://nelf.gov.ng/", scope: ["student-loans", "eligibility", "loan-guidance"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "tetfund", name: "Tertiary Education Trust Fund", url: "https://tetfund.gov.ng/", scope: ["tertiary-funding", "institutional-support", "research"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "nbte", name: "National Board for Technical Education", url: "https://web.nbte.gov.ng/", scope: ["polytechnics", "technical-education", "accreditation"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "ncce", name: "National Commission for Colleges of Education", url: "https://ncce.gov.ng/", scope: ["colleges-of-education", "teacher-education"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "neco", name: "National Examinations Council", url: "https://neco.gov.ng/", scope: ["examinations", "results", "registration"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
  { id: "waec-ng", name: "West African Examinations Council Nigeria", url: "https://waecnigeria.org/", scope: ["examinations", "results", "registration"], authority: "primary", country: "NG", verifiedAt: "2026-10-31" },
];

/** Domain matching prevents a lookalike link from inheriting source trust. */
export function matchesTrustedSource(candidateUrl: string, source: TrustedSource): boolean {
  try {
    const candidate = new URL(candidateUrl);
    const trusted = new URL(source.url);
    return candidate.protocol === "https:" &&
      (candidate.hostname === trusted.hostname || candidate.hostname.endsWith("." + trusted.hostname));
  } catch {
    return false;
  }
}
