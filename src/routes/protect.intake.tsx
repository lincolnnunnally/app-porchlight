import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AttorneyFlag } from "@/components/attorney-flag";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  AGE_RANGES,
  COUNTIES,
  DEED_OPTIONS,
  intakeComplete,
} from "@/lib/steward";
import { useStewardStore } from "@/lib/steward-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/protect/intake")({
  component: IntakePage,
});

function IntakePage() {
  const season = useStewardStore((s) => s.season);
  const intake = useStewardStore((s) => s.intake);
  const setIntake = useStewardStore((s) => s.setIntake);
  const navigate = useNavigate();

  if (season === "crisis") {
    return (
      <RedirectNote
        title="Crisis season — facts stay with an attorney, not a transfer packet."
        to="/protect/crisis"
        action="Open the crisis path"
      />
    );
  }

  if (season === "unknown") {
    return (
      <RedirectNote
        title="Start with the season quiz so we don’t build the wrong packet."
        to="/protect/quiz"
        action="Take the quiz"
      />
    );
  }

  return (
    <form
      className="mx-auto grid max-w-xl gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (intakeComplete(intake)) navigate({ to: "/protect/fees" });
      }}
    >
      <h1 className="font-display text-3xl">Facts, not conclusions</h1>
      <p className="text-muted">
        We fill attorney-approved templates with what you tell us. Title is not
        verified here. An attorney still has to look.
      </p>
      <AttorneyFlag>
        Intake copy and field list need attorney sign-off before production.
        No hidden “we’ll take the house” language belongs anywhere on this
        screen.
      </AttorneyFlag>
      <Field label="Homeowner full name">
        <Input
          required
          value={intake.homeowner}
          onChange={(e) => setIntake({ homeowner: e.target.value })}
        />
      </Field>
      <Field label="Age range">
        <Select
          value={intake.ageRange}
          onChange={(e) => setIntake({ ageRange: e.target.value })}
        >
          {AGE_RANGES.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </Select>
      </Field>
      <Field label="County">
        <Select
          value={intake.county}
          onChange={(e) => setIntake({ county: e.target.value })}
        >
          {COUNTIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      <Field label="Property address">
        <Input
          required
          placeholder="201 Maple Dr, Vidalia"
          value={intake.address}
          onChange={(e) => setIntake({ address: e.target.value })}
        />
      </Field>
      <Field label="Deed status, if known">
        <Select
          value={intake.deed}
          onChange={(e) => setIntake({ deed: e.target.value })}
        >
          {DEED_OPTIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Who lives there now">
        <Textarea
          rows={2}
          value={intake.whoLives}
          onChange={(e) => setIntake({ whoLives: e.target.value })}
        />
      </Field>
      <Field label="Spouse">
        <Select
          value={intake.spouse}
          onChange={(e) => setIntake({ spouse: e.target.value })}
        >
          <option value="no">No living spouse</option>
          <option value="yes">Yes</option>
        </Select>
      </Field>
      {intake.spouse === "yes" ? (
        <Field label="Does the spouse live in the home?">
          <Select
            value={intake.spouseInHome}
            onChange={(e) => setIntake({ spouseInHome: e.target.value })}
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Field>
      ) : null}
      <Field label="Children living in the home">
        <Select
          value={intake.childrenInHome}
          onChange={(e) => setIntake({ childrenInHome: e.target.value })}
        >
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </Select>
      </Field>
      {intake.childrenInHome === "yes" ? (
        <Field
          label="Ages, and whether any child is blind or disabled"
          hint="This can delay estate recovery. We do not decide that here."
        >
          <Textarea
            rows={2}
            value={intake.childNotes}
            onChange={(e) => setIntake({ childNotes: e.target.value })}
          />
        </Field>
      ) : null}
      <Field label="Intent to stay">
        <Select
          value={intake.stayYears}
          onChange={(e) => setIntake({ stayYears: e.target.value })}
        >
          <option value="5+">Five or more years, if health allows</option>
          <option value="2-4">A few years</option>
          <option value="unsure">Unsure</option>
        </Select>
      </Field>
      <Field label="Adult child / family contact">
        <Input
          required
          value={intake.adultChild}
          onChange={(e) => setIntake({ adultChild: e.target.value })}
        />
      </Field>
      <Field label="Contact (phone or email)">
        <Input
          required
          value={intake.adultChildContact}
          onChange={(e) => setIntake({ adultChildContact: e.target.value })}
        />
      </Field>
      <Field
        label="Who should receive remainder after a later sale"
        hint="Named beneficiaries. Blank defaults to the family contact."
      >
        <Input
          value={intake.remainder}
          onChange={(e) => setIntake({ remainder: e.target.value })}
        />
      </Field>
      <Field label="Who is filling this out">
        <Input
          value={intake.filledBy}
          onChange={(e) => setIntake({ filledBy: e.target.value })}
        />
      </Field>
      <Button type="submit" disabled={!intakeComplete(intake)}>
        See the fee schedule
      </Button>
    </form>
  );
}

function RedirectNote({
  title,
  to,
  action,
}: {
  title: string;
  to: string;
  action: string;
}) {
  return (
    <div className="grid max-w-xl gap-4">
      <h1 className="font-display text-3xl">{title}</h1>
      <Link to={to} className={cn(buttonVariants(), "no-underline")}>
        {action}
      </Link>
    </div>
  );
}
