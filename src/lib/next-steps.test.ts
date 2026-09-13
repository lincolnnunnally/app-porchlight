import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HUNT_SEED } from "./hunt.ts";
import {
  countyNameForIntake,
  donateConversationNote,
  giftIntentNote,
  houseLine,
  protectHouseAddress,
} from "./next-steps.ts";

describe("house next steps", () => {
  it("maps Vidalia to the Keep intake county name", () => {
    assert.equal(countyNameForIntake("Vidalia"), "Toombs");
    assert.equal(countyNameForIntake("Lyons"), "Toombs");
    assert.equal(countyNameForIntake("Atlanta"), "Other Georgia county");
  });

  it("keeps donate copy honest: no receipt, no deduction promise", () => {
    const note = donateConversationNote("412 W First St", "Vidalia");
    assert.match(note, /412 W First St, Vidalia, GA/);
    assert.match(note, /does not issue a tax receipt/i);
    assert.match(note, /does not promise a deduction/i);
    assert.match(note, /attorney still papers the deed/i);
    assert.match(note, /do not take houses/i);
    assert.doesNotMatch(note, /here is your receipt/i);
    assert.doesNotMatch(note, /you may deduct/i);
  });

  it("labels hunt seed houses as samples, not real hunts", () => {
    assert.ok(HUNT_SEED.length > 0);
    assert.ok(HUNT_SEED.every((h) => h.sample === true));
  });

  it("records gift intent without pretending the gift is complete", () => {
    const intent = giftIntentNote("100 Courthouse Sq", "Lyons");
    assert.match(intent, /Gift intent/);
    assert.match(intent, /not a tax receipt/);
    assert.equal(houseLine("100 Courthouse Sq", "Lyons"), "100 Courthouse Sq, Lyons, GA");
    assert.equal(protectHouseAddress("201 Maple Dr", "Vidalia"), "201 Maple Dr, Vidalia");
  });
});
