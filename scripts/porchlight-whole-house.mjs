import { chromium } from "playwright";

const base = process.env.PORCHLIGHT_URL || "http://127.0.0.1:8080";

async function enterAddress(page, { address, purpose }) {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByLabel("Street address").fill(address);
  await page.getByRole("button", { name: purpose, exact: true }).click();
  await page.getByRole("button", { name: "Look this place up" }).click();
  await page.waitForURL(/\/place\//, { timeout: 15000 });
  await page.waitForLoadState("networkidle");
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const fail = [];

  const sell = await browser.newContext();
  const sellPage = await sell.newPage();
  try {
    await enterAddress(sellPage, {
      address: "412 W First St",
      purpose: "Sell without a listing machine",
    });
    const url = sellPage.url();
    if (!/\/place\//.test(url)) fail.push(`sell left the house: ${url}`);
    if (!/[?&]want=sell/.test(url)) fail.push(`sell: want missing from ${url}`);
    await sellPage.getByRole("heading", {
      name: "Write the owner from this house",
    }).waitFor({ timeout: 8000 });
    await sellPage.getByRole("button", { name: "Save on this house" }).click();
    await sellPage.getByText("Saved on this house.").waitFor({ timeout: 5000 });
    if (!/\/place\//.test(sellPage.url())) fail.push("sell dumped after save");
  } catch (e) {
    fail.push(`sell: ${e.message}`);
  }
  await sell.close();

  const live = await browser.newContext();
  const livePage = await live.newPage();
  try {
    await enterAddress(livePage, {
      address: "100 Courthouse Sq",
      purpose: "I want to live here",
    });
    await livePage.getByRole("heading", {
      name: "Ask to be told about this house",
    }).waitFor({ timeout: 8000 });
    await livePage.getByLabel("Your name").fill("Reed family");
    await livePage.getByLabel("Phone").fill("912-555-0100");
    await livePage.getByRole("button", { name: "Ask to be told", exact: true }).click();
    await livePage.getByText("You are on the list for this house.").waitFor({
      timeout: 5000,
    });
    if (!/\/place\//.test(livePage.url())) fail.push("live dumped after waitlist");
  } catch (e) {
    fail.push(`live: ${e.message}`);
  }
  await live.close();

  const donate = await browser.newContext();
  const donatePage = await donate.newPage();
  try {
    await enterAddress(donatePage, {
      address: "201 Maple Dr",
      purpose: "Donate the property",
    });
    await donatePage.getByRole("heading", {
      name: "Give it so someone can live there",
    }).waitFor({ timeout: 8000 });
    const body = await donatePage.locator("#next-step").innerText();
    if (!/do not issue a tax receipt/i.test(body)) {
      fail.push("donate: missing honest no-receipt copy");
    }
    if (/you may deduct/i.test(body)) fail.push("donate: promised a deduction");
    await donatePage.getByRole("button", {
      name: "Save gift intent on this house",
    }).click();
    await donatePage.getByText("Gift intent is on this house").waitFor({
      timeout: 5000,
    });
    if (!/\/place\//.test(donatePage.url())) fail.push("donate dumped after save");
  } catch (e) {
    fail.push(`donate: ${e.message}`);
  }
  await donate.close();

  const keep = await browser.newContext();
  const keepPage = await keep.newPage();
  try {
    await enterAddress(keepPage, {
      address: "918 Durden St",
      purpose: "Keep use of the home",
    });
    await keepPage.getByRole("heading", {
      name: "Plan while someone is still well",
    }).waitFor({ timeout: 8000 });
    await keepPage.getByRole("link", { name: "Start with the season" }).click();
    await keepPage.waitForURL(/\/protect\/quiz/, { timeout: 10000 });
    await keepPage.getByText("This is for 918 Durden St, Vidalia").waitFor({
      timeout: 8000,
    });
  } catch (e) {
    fail.push(`keep: ${e.message}`);
  }
  await keep.close();

  const hunt = await browser.newContext();
  const huntPage = await hunt.newPage();
  try {
    await huntPage.goto(`${base}/hunt`, { waitUntil: "networkidle" });
    const samples = await huntPage.getByText("Sample", { exact: true }).count();
    if (samples < 1) fail.push("hunt: seed houses not labeled Sample");
  } catch (e) {
    fail.push(`hunt: ${e.message}`);
  }
  await hunt.close();

  await browser.close();
  if (fail.length) {
    console.error("FAIL\n" + fail.join("\n"));
    process.exit(1);
  }
  console.log("PASS: sell, live, donate, keep stay on the house; hunt samples labeled");
}

main();
