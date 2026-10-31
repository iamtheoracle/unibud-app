/**
 * UNIBUD source registry.
 *
 * Registry inclusion classifies a publisher or discovery catalogue; it does
 * not certify an individual claim, article, image, or licence. Every item
 * still needs provenance checks and editorial approval before publication.
 */
export type SourceAuthority = "primary" | "academic" | "research" | "media" | "discovery";
export type SourceRegion = "NG" | "GLOBAL" | "EU" | "UK" | "US" | "AFRICA";

export type TrustedSource = {
  id: string;
  name: string;
  url: string;
  scope: string[];
  authority: SourceAuthority;
  country: SourceRegion;
  verifiedAt: string;
  notes?: string;
};

const REGISTRY_REVIEW_DATE = "2026-10-31";

export const UNIBUD_SOURCE_REGISTRY: TrustedSource[] = [
  // Nigeria: government, regulators, admissions, examinations and funding.
  { id: "ng-fme", name: "Federal Ministry of Education", url: "https://education.gov.ng/", scope: ["national-policy", "scholarships", "education-news"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-nuc", name: "National Universities Commission", url: "https://www.nuc.edu.ng/", scope: ["universities", "accreditation", "university-programmes"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-enuc", name: "Electronic National Universities Commission", url: "https://enuc.nuc.edu.ng/", scope: ["university-directory", "programmes", "academic-information"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-jamb", name: "Joint Admissions and Matriculation Board", url: "https://www.jamb.gov.ng/", scope: ["admissions", "utme", "caps", "registration"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-nelfund", name: "Nigeria Education Loan Fund", url: "https://nelf.gov.ng/", scope: ["student-loans", "eligibility", "loan-guidance"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-tetfund", name: "Tertiary Education Trust Fund", url: "https://tetfund.gov.ng/", scope: ["tertiary-funding", "institutional-support", "research"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-nbte", name: "National Board for Technical Education", url: "https://web.nbte.gov.ng/", scope: ["polytechnics", "technical-education", "accreditation"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-ncce", name: "National Commission for Colleges of Education", url: "https://ncce.gov.ng/", scope: ["colleges-of-education", "teacher-education"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-neco", name: "National Examinations Council", url: "https://neco.gov.ng/", scope: ["examinations", "results", "registration"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "ng-waec", name: "West African Examinations Council Nigeria", url: "https://waecnigeria.org/", scope: ["examinations", "results", "registration"], authority: "primary", country: "NG", verifiedAt: REGISTRY_REVIEW_DATE },

  // International and regional public institutions.
  { id: "unesco", name: "UNESCO", url: "https://www.unesco.org/", scope: ["global-education", "policy", "culture", "science"], authority: "primary", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "unesco-uis", name: "UNESCO Institute for Statistics", url: "https://uis.unesco.org/", scope: ["education-statistics", "global-data", "indicators"], authority: "research", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "world-bank-education", name: "World Bank Education", url: "https://www.worldbank.org/en/topic/education", scope: ["education-policy", "research", "development-data"], authority: "research", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "oecd-education", name: "OECD Education", url: "https://www.oecd.org/education/", scope: ["education-policy", "comparative-data", "research"], authority: "research", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "african-union", name: "African Union", url: "https://au.int/", scope: ["africa-policy", "youth", "education", "regional-programmes"], authority: "primary", country: "AFRICA", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "afdb", name: "African Development Bank", url: "https://www.afdb.org/", scope: ["africa-development", "education-projects", "youth-employment"], authority: "primary", country: "AFRICA", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "erasmus-plus", name: "Erasmus+", url: "https://erasmus-plus.ec.europa.eu/", scope: ["europe-study", "exchange", "grants", "mobility"], authority: "primary", country: "EU", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "eu-education", name: "European Commission Education and Training", url: "https://education.ec.europa.eu/", scope: ["europe-policy", "education-programmes", "qualifications"], authority: "primary", country: "EU", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "uk-ucas", name: "UCAS", url: "https://www.ucas.com/", scope: ["uk-admissions", "courses", "application-guidance"], authority: "primary", country: "UK", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "uk-british-council", name: "British Council", url: "https://www.britishcouncil.org/", scope: ["international-education", "study-abroad", "scholarships"], authority: "primary", country: "UK", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "us-education", name: "U.S. Department of Education", url: "https://www.ed.gov/", scope: ["us-education-policy", "student-aid", "federal-guidance"], authority: "primary", country: "US", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "us-collegeboard", name: "College Board", url: "https://www.collegeboard.org/", scope: ["us-admissions", "testing", "financial-aid-guidance"], authority: "primary", country: "US", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "us-nsf", name: "National Science Foundation", url: "https://www.nsf.gov/", scope: ["research-funding", "science", "student-opportunities"], authority: "primary", country: "US", verifiedAt: REGISTRY_REVIEW_DATE },
  { id: "us-nih", name: "National Institutes of Health", url: "https://www.nih.gov/", scope: ["health-research", "research-funding", "science"], authority: "primary", country: "US", verifiedAt: REGISTRY_REVIEW_DATE },

  // Research discovery catalogues: records must be traced to original papers.
  { id: "crossref", name: "Crossref", url: "https://www.crossref.org/", scope: ["scholarly-metadata", "doi", "publication-discovery"], authority: "discovery", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE, notes: "Metadata discovery only; verify the publisher version and paper contents." },
  { id: "openalex", name: "OpenAlex", url: "https://openalex.org/", scope: ["research-discovery", "scholarly-works", "institutions"], authority: "discovery", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE, notes: "Research index, not the primary source for claims." },
  { id: "pubmed", name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", scope: ["biomedical-research", "literature-discovery"], authority: "discovery", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE, notes: "Check the original article, study design, corrections and retractions." },

  // Image discovery/catalogues. Rights are checked per asset, never inherited.
  { id: "wikimedia-commons", name: "Wikimedia Commons", url: "https://commons.wikimedia.org/", scope: ["image-discovery", "public-domain", "creative-commons"], authority: "discovery", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE, notes: "Check each file page for exact licence, author, attribution and restrictions." },
  { id: "openverse", name: "Openverse", url: "https://openverse.org/", scope: ["openly-licensed-image-discovery", "audio-discovery"], authority: "discovery", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE, notes: "Discovery catalogue only; verify the original asset page and licence." },
  { id: "unsplash", name: "Unsplash", url: "https://unsplash.com/license", scope: ["stock-photography"], authority: "discovery", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE, notes: "Apply the current platform licence and restrictions to each downloaded asset." },
  { id: "pexels", name: "Pexels", url: "https://www.pexels.com/license/", scope: ["stock-photography", "stock-video"], authority: "discovery", country: "GLOBAL", verifiedAt: REGISTRY_REVIEW_DATE, notes: "Apply the current platform licence and restrictions to each downloaded asset." },
];

/** Backwards-compatible Nigerian education source export. */
export const TRUSTED_NIGERIAN_EDUCATION_SOURCES = UNIBUD_SOURCE_REGISTRY.filter(
  (source) => source.country === "NG" && source.scope.some((scope) =>
    ["universities", "admissions", "examinations", "scholarships", "student-loans", "education-news"].includes(scope),
  ),
);

/** Domain matching prevents lookalike links from inheriting source classification. */
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

/** Classifies a URL only; it does not verify the truth of its content. */
export function findRegisteredSource(candidateUrl: string): TrustedSource | undefined {
  return UNIBUD_SOURCE_REGISTRY.find((source) => matchesTrustedSource(candidateUrl, source));
}
