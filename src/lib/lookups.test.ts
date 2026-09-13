import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  countyForCity,
  fullAddress,
  normalizePlaceKey,
  propertyLookups,
} from "./lookups.ts";

describe("property lookups", () => {
  it("maps Vidalia to Toombs County qPublic", () => {
    const county = countyForCity("Vidalia");
    assert.equal(county?.slug, "toombs");
    const links = propertyLookups("100 Courthouse Sq", "Vidalia");
    assert.ok(links.some((l) => l.id === "assessor" && l.href.includes("toombs")));
    assert.ok(links.some((l) => l.id === "gis"));
    assert.ok(links.some((l) => l.id === "zillow" && l.href.includes("zillow.com")));
    assert.ok(links.some((l) => l.id === "mls" && l.href.includes("realtor.com")));
    assert.ok(links.some((l) => l.id === "sos" && l.href.includes("sos.ga.gov")));
    assert.ok(links.some((l) => l.id === "street" && l.href.includes("google.com/maps")));
    assert.ok(links.some((l) => l.id === "deeds" && l.href.includes("gsccca")));
  });

  it("does not invent a county page for an unknown city", () => {
    const links = propertyLookups("1 Peachtree St", "Atlanta");
    assert.equal(countyForCity("Atlanta"), null);
    assert.ok(links.some((l) => l.id === "assessor-find"));
    assert.ok(!links.some((l) => l.id === "assessor"));
    assert.ok(links.some((l) => l.id === "zillow"));
  });

  it("normalizes address keys so hunt and rent can share a place", () => {
    assert.equal(
      normalizePlaceKey("918 Durden St.", "Vidalia"),
      normalizePlaceKey("918 Durden St", "Vidalia"),
    );
    assert.equal(fullAddress("918 Durden St", "Vidalia"), "918 Durden St, Vidalia, GA");
  });
});
