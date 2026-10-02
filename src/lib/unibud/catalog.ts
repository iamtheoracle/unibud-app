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


export const CATEGORIES: { id: ListingCategory; label: string; blurb: string }[] = [
  { id: "accommodation", label: "Stay", blurb: "Hostels, rooms, roommates" },
  { id: "food", label: "Food", blurb: "Plates, snacks, meal plans" },
  { id: "fashion", label: "Fashion", blurb: "Thrift, custom, campus fits" },
  { id: "electronics", label: "Tech", blurb: "Phones, laptops, gear" },
  { id: "books", label: "Books", blurb: "Texts, past questions, tools" },
  { id: "beauty", label: "Beauty", blurb: "Hair, barber, care" },
  { id: "transport", label: "Rides", blurb: "Campus moves and lifts" },
  { id: "events", label: "Events", blurb: "Tickets, nights, portraits" },
  { id: "services", label: "Services", blurb: "Skills students already have" },
  { id: "other", label: "Other", blurb: "Everything else on campus" },
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

