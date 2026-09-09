import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_HOUSE_FACTS,
  ackHouseFacts,
  applyFactsAmendment,
  factsReadyForKeys,
  listingFacts,
  withHouseFactsSpine,
} from "./house-facts.ts";

const base = withHouseFactsSpine({
  id: "r1",
  address: "312 First Ave",
  city: "Vidalia",
  bedsBaths: "2 / 1",
  fairRent: 650,
  listing: "available",
  intent: "rent",
  status: "vacant",
  notes: "Honest heat",
});

describe("house facts spine", () => {
  it("keeps one sheet on the house and does not bump an unchanged save", () => {
    const next = applyFactsAmendment(base, { ...base.facts });
    assert.equal(next.factsVersion, 1);
    assert.equal(next.factsHistory.length, 0);
  });

  it("treats an amendment as a new version on the same record", () => {
    const next = applyFactsAmendment(base, {
      ...base.facts,
      trashDay: "Friday",
    });
    assert.equal(next.factsVersion, 2);
    assert.equal(next.facts.trashDay, "Friday");
    assert.equal(next.factsHistory[0]?.version, 1);
    assert.equal(factsReadyForKeys(next), false);
  });

  it("requires both seats to ack the current version before keys", () => {
    const owner = ackHouseFacts(base, "owner", "Porchlight Steward");
    assert.equal(factsReadyForKeys(owner, "l1"), false);
    const both = ackHouseFacts(owner, "renter", "Reed family", Date.now(), "l1");
    assert.equal(factsReadyForKeys(both, "l1"), true);
    const amended = applyFactsAmendment(both, {
      ...both.facts,
      lawnWho: "Owner",
    });
    assert.equal(factsReadyForKeys(amended, "l1"), false);
    assert.ok(amended.factsAcks.some((ack) => ack.version === 1));
  });

  it("does not let a prior household's ack unlock keys for a new lease", () => {
    const owner = ackHouseFacts(base, "owner", "Porchlight Steward");
    const prior = ackHouseFacts(
      owner,
      "renter",
      "Reed family",
      Date.now(),
      "l1",
    );
    assert.equal(factsReadyForKeys(prior, "l1"), true);
    assert.equal(factsReadyForKeys(prior, "l2"), false);
    assert.equal(factsReadyForKeys(prior), false);
    const nextHousehold = ackHouseFacts(
      prior,
      "renter",
      "Tanya Miles",
      Date.now(),
      "l2",
    );
    assert.equal(factsReadyForKeys(nextHousehold, "l1"), true);
    assert.equal(factsReadyForKeys(nextHousehold, "l2"), true);
    assert.ok(
      nextHousehold.factsAcks.some(
        (ack) => ack.party === "renter" && ack.leaseId === "l1",
      ),
    );
  });

  it("lets a later listing read the same fields without the wifi password", () => {
    const filled = applyFactsAmendment(base, {
      ...EMPTY_HOUSE_FACTS,
      wifiNetwork: "ReedPorch",
      wifiPassword: "secret",
      trashDay: "Thursday",
      furnished: "unfurnished",
      propertyKind: "residential",
    });
    const listed = listingFacts(filled);
    assert.equal(listed.homeId, "r1");
    assert.equal(listed.trashDay, "Thursday");
    assert.equal(listed.furnished, "unfurnished");
    assert.equal(listed.propertyKind, "residential");
    assert.equal(
      Object.prototype.hasOwnProperty.call(listed, "wifiPassword"),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(listed, "wifiNetwork"),
      false,
    );
  });
});
