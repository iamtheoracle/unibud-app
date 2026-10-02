import type {
  Community,
  DirectoryPerson,
  DiscoveryItem,
  FeedPost,
  Listing,
  ListingCategory,
  University,
} from "./types";

export const UNIVERSITIES: University[] = [
  { id: "unilag", name: "University of Lagos", shortName: "UNILAG", city: "Lagos" },
  { id: "ui", name: "University of Ibadan", shortName: "UI", city: "Ibadan" },
  { id: "unn", name: "University of Nigeria", shortName: "UNN", city: "Nsukka" },
  { id: "abu", name: "Ahmadu Bello University", shortName: "ABU", city: "Zaria" },
  { id: "oau", name: "Obafemi Awolowo University", shortName: "OAU", city: "Ile-Ife" },
  { id: "uniben", name: "University of Benin", shortName: "UNIBEN", city: "Benin City" },
  { id: "lasu", name: "Lagos State University", shortName: "LASU", city: "Lagos" },
  { id: "futa", name: "Federal University of Technology Akure", shortName: "FUTA", city: "Akure" },
  { id: "uniport", name: "University of Port Harcourt", shortName: "UNIPORT", city: "Port Harcourt" },
  { id: "covenant", name: "Covenant University", shortName: "Covenant", city: "Ota" },
  { id: "uon", name: "University of Nairobi", shortName: "UoN", city: "Nairobi" },
  { id: "wits", name: "University of the Witwatersrand", shortName: "Wits", city: "Johannesburg" },
];

export const PEOPLE: DirectoryPerson[] = [];

export const LISTINGS: Listing[] = [];

export const COMMUNITIES: Community[] = [];

export const POSTS: FeedPost[] = [];

export const DISCOVERY: DiscoveryItem[] = [];

export const SAMPLE_COURSES: { code: string; title: string }[] = [];

export function personByHandle(handle: string): DirectoryPerson | undefined {
  return PEOPLE.find((p) => p.handle === handle);
}

export function listingById(id: string): Listing | undefined {
  return LISTINGS.find((l) => l.id === id);
}

export function uniById(id: string): University | undefined {
  return UNIVERSITIES.find((u) => u.id === id);
}

export function communityById(id: string): Community | undefined {
  return COMMUNITIES.find((c) => c.id === id);
}

