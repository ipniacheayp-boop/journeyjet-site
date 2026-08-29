import cdg from "@/assets/deals/cdg.jpg";
import cun from "@/assets/deals/cun.jpg";
import hnl from "@/assets/deals/hnl.jpg";
import jfk from "@/assets/deals/jfk.jpg";
import las from "@/assets/deals/las.jpg";
import lax from "@/assets/deals/lax.jpg";
import lhr from "@/assets/deals/lhr.jpg";
import mco from "@/assets/deals/mco.jpg";
import mia from "@/assets/deals/mia.jpg";
import nrt from "@/assets/deals/nrt.jpg";
import ord from "@/assets/deals/ord.jpg";
import sfo from "@/assets/deals/sfo.jpg";
import generic from "@/assets/destinations/city-skyline-1.jpg";

/**
 * Destination-specific imagery, keyed by the arrival airport IATA code. A code
 * is only ever mapped to a photo of its own city — anything unmapped uses the
 * single neutral fallback rather than another destination's picture.
 */
const DESTINATION_IMAGES: Record<string, string> = {
  // New York area
  JFK: jfk,
  LGA: jfk,
  EWR: jfk,
  // Los Angeles
  LAX: lax,
  BUR: lax,
  // Las Vegas
  LAS: las,
  // Orlando
  MCO: mco,
  MLB: mco,
  // Miami
  MIA: mia,
  FLL: mia,
  // Chicago
  ORD: ord,
  MDW: ord,
  // San Francisco Bay
  SFO: sfo,
  OAK: sfo,
  SJC: sfo,
  // Honolulu
  HNL: hnl,
  // Cancun
  CUN: cun,
  // London
  LHR: lhr,
  LGW: lhr,
  LCY: lhr,
  STN: lhr,
  // Paris
  CDG: cdg,
  ORY: cdg,
  // Tokyo
  NRT: nrt,
  HND: nrt,
};

export const GENERIC_DESTINATION_IMAGE = generic;

export const getDestinationImage = (iataCode?: string | null): string => {
  if (!iataCode) return GENERIC_DESTINATION_IMAGE;
  return DESTINATION_IMAGES[iataCode.toUpperCase()] ?? GENERIC_DESTINATION_IMAGE;
};
