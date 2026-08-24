"use client";

import { useState, type FormEvent } from "react";
import { DesktopAppWindow } from "@/components/home/DesktopAppWindow";
import { useLanguage } from "@/lib/language-context";
import { LANGUAGE_LOCALE } from "@/lib/translations";

const CONTACT_EMAIL = "vanessalt08@gmail.com";

// Simple enough on purpose — this only gates step progress (a real address
// is still verified by the recipient reading it), not full RFC 5322
// validation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The animated underline every floating-label field shares: a hairline
// base border (set by the field itself) plus this colored overlay, which
// grows out from the center to full width on focus — same idea as the
// classic Uiverse "input" component's .bar:before/.bar:after. Must be a
// direct sibling *after* the field's own `.peer` element for peer-focus
// to reach it.
function FloatingUnderline() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px before:absolute before:bottom-0 before:left-1/2 before:h-px before:w-0 before:bg-white/70 before:transition-all before:duration-200 before:content-[''] after:absolute after:bottom-0 after:right-1/2 after:h-px after:w-0 after:bg-white/70 after:transition-all after:duration-200 after:content-[''] peer-focus:before:w-1/2 peer-focus:after:w-1/2"
    />
  );
}

// The brief translucent flash that plays once when a field gains focus —
// see the input-highlight keyframe in globals.css. Idle state matches the
// keyframe's own end state (0-width, transparent) so it has nothing to
// visually reset once the flash finishes.
function FloatingHighlight() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-1/4 h-1/2 w-0 bg-transparent peer-focus:[animation:input-highlight_0.3s_ease]"
    />
  );
}

// Shared "floating label" classes for text fields: the label sits where a
// placeholder normally would, then shrinks and moves above the field once
// it's focused or has *any* text in it — kept in its normal casing (not
// uppercased) so it still reads as the same label, just smaller.
//
// The "has text" check is peer-[&:not(:placeholder-shown)] rather than
// peer-valid: :valid only matches a *fully* valid value (e.g. a complete
// email with an @), so for type="email" a partially typed value stays
// :invalid — with peer-valid, blurring mid-type would drop the label back
// down on top of what's already been typed. :not(:placeholder-shown) only
// cares whether the field is empty (placeholder=" " is showing) or not,
// regardless of validity.
const FLOATING_LABEL_CLASSNAME =
  "pointer-events-none absolute left-0 top-4 text-white/30 transition-all duration-200 peer-focus:top-0 peer-focus:text-xs peer-focus:font-medium peer-focus:tracking-wide peer-focus:text-white/40 peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:font-medium peer-[&:not(:placeholder-shown)]:tracking-wide peer-[&:not(:placeholder-shown)]:text-white/40";

function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  required = true,
  errorMessage,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  // Shown below the field instead of relying on the browser's own native
  // validation popup — that popup only fires at submit time and only for
  // whichever step happens to still be mounted then (see canAdvance's own
  // comment), so it can't reliably reach an earlier step's field like this.
  errorMessage?: string;
}) {
  return (
    <div>
      {/* FloatingUnderline/Highlight are `absolute … bottom-0` — they need
          this row's own height as their positioning context, not the
          errorMessage's below it, so that message is a sibling *outside*
          this div rather than a child inside it. */}
      <div className="relative">
        <input
          id={id}
          type={type}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder=" "
          className="peer block w-full border-b border-white/20 bg-transparent pb-2 pt-4 text-white placeholder-transparent focus:outline-none"
        />
        <label htmlFor={id} className={FLOATING_LABEL_CLASSNAME}>
          {label}
        </label>
        <FloatingUnderline />
        <FloatingHighlight />
      </div>
      {errorMessage && (
        <p className="mt-1.5 text-xs text-[#ffb454]">{errorMessage}</p>
      )}
    </div>
  );
}

function FloatingTextarea({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      {/* No `required` here — this is the project textarea, gated instead
          by the Enviar button's own disabled state (see canSubmitLastStep
          below) so an empty field disables the button instead of popping
          up the browser's native "Please fill out this field" tooltip. */}
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        className="peer block w-full resize-none border-b border-white/20 bg-transparent pb-2 pt-4 text-white placeholder-transparent focus:outline-none"
      />
      <label htmlFor={id} className={FLOATING_LABEL_CLASSNAME}>
        {label}
      </label>
      <FloatingUnderline />
    </div>
  );
}

export function NotesContactCard() {
  const { t, language } = useLanguage();

  // Computed per-render (not a module-level constant) so it can't get
  // frozen at whatever moment the server first loaded this module and
  // then drift from the client's own "today" — suppressHydrationWarning
  // on the two spots below still covers the rare case where a request
  // straddles midnight between the server render and the client render.
  const todayLabel = new Date().toLocaleDateString(LANGUAGE_LOCALE[language], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [brandName, setBrandName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [message, setMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [step, setStep] = useState(0);

  const stepCount = t.notes.steps.length;
  const isLastStep = step === stepCount - 1;
  // Every field but website is required, so progress is gated on the
  // *current* step's fields all being filled — not just checked at the
  // very end, since a required field left blank on an earlier, now-
  // unmounted step couldn't be reported by the browser's native validation
  // on submit. Email is checked against EMAIL_PATTERN (not just
  // non-empty) for the same reason: the native type="email" check only
  // covers whichever step is currently mounted, and this field is gone by
  // the time the form actually submits.
  const canAdvance =
    step === 0
      ? name.trim() !== "" && EMAIL_PATTERN.test(email.trim())
      : brandName.trim() !== "";
  // Website is the one optional field, so the last step's own gate (below)
  // doesn't include it.
  const canSubmitLastStep = message.trim() !== "" && budget.trim() !== "";

  function goToNextStep() {
    if (!canAdvance) return;
    setStep((current) => Math.min(current + 1, stepCount - 1));
  }

  function goToPreviousStep() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const { email: emailCopy } = t.notes;
    const subject = `${emailCopy.subjectPrefix} ${brandName || name || emailCopy.unnamedFallback}`;
    const body = [
      message,
      "",
      `${emailCopy.brandLabel}: ${brandName}`,
      `${emailCopy.websiteLabel}: ${websiteLink}`,
      `${emailCopy.budgetLabel}: ${budget}`,
      "",
      `— ${name} (${email})`,
    ].join("\n");
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }

  return (
    <DesktopAppWindow title={t.notes.windowTitle} className="h-full w-full">
      {/* Sidebar */}
      <div className="hidden w-44 shrink-0 flex-col border-r border-white/10 bg-[#242426] px-2.5 py-4 sm:flex">
        <div className="flex items-center gap-1.5 px-1 text-xs font-semibold text-white/40">
          <span>{t.notes.sidebarToday}</span>
        </div>
        <div className="mt-2 rounded-md bg-white/10 px-3 py-2">
          <p className="truncate text-sm font-semibold text-white">
            {t.notes.heading}
          </p>
          <p className="mt-0.5 text-xs text-white/50" suppressHydrationWarning>
            {todayLabel}
          </p>
        </div>
      </div>

      {/* Note content — the "note" is the contact form itself. */}
      <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-10 sm:py-8">
        <p className="text-xs text-white/40" suppressHydrationWarning>
          {todayLabel}
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          {t.notes.heading}
        </h2>
        <p className="mt-2 max-w-lg text-sm text-white/60">{t.notes.description}</p>

        {/* Step progress — a dot per phase (filled once passed, ringed on
            the current one) with a connecting line, plus its label
            underneath. Same look language as the rest of the window
            (uppercase tracking-wide labels, no boxed/card wrapper). */}
        <div className="mt-6 max-w-lg">
          <div className="flex items-center">
            {t.notes.steps.map((stepLabel, index) => (
              <div key={stepLabel} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${
                    index <= step
                      ? "bg-white text-[#171410]"
                      : "border border-white/25 text-white/40"
                  }`}
                >
                  {index < step ? "✓" : index + 1}
                </span>
                {index < stepCount - 1 && (
                  <span
                    className={`mx-1.5 h-px flex-1 transition-colors ${
                      index < step ? "bg-white/60" : "bg-white/15"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            {t.notes.steps.map((stepLabel, index) => (
              <span
                key={stepLabel}
                className={`text-[10px] uppercase tracking-wide ${
                  index === step ? "text-white" : "text-white/40"
                }`}
              >
                {stepLabel}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 max-w-lg">
          <div className="space-y-6">
            {step === 0 && (
              <>
                <FloatingInput
                  id="contact-name"
                  label={t.notes.fields.name.label}
                  value={name}
                  onChange={setName}
                />
                <FloatingInput
                  id="contact-email"
                  type="email"
                  label={t.notes.fields.email.label}
                  value={email}
                  onChange={setEmail}
                  errorMessage={
                    email.trim() !== "" && !EMAIL_PATTERN.test(email.trim())
                      ? t.notes.fields.email.invalidMessage
                      : undefined
                  }
                />
              </>
            )}

            {step === 1 && (
              <>
                <FloatingInput
                  id="contact-brand"
                  label={t.notes.fields.brand.label}
                  value={brandName}
                  onChange={setBrandName}
                />
                <FloatingInput
                  id="contact-website"
                  label={t.notes.fields.website.label}
                  value={websiteLink}
                  onChange={setWebsiteLink}
                  required={false}
                />
              </>
            )}

            {step === 2 && (
              <>
                <FloatingTextarea
                  id="contact-project"
                  label={t.notes.fields.project.label}
                  value={message}
                  onChange={setMessage}
                />

                <label className="block">
                  <span className="text-xs font-medium tracking-wide text-white/40">
                    {t.notes.fields.budget.label}
                  </span>
                  <select
                    required
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="mt-1 w-full border-b border-white/20 bg-transparent pb-2 text-white focus:border-white/60 focus:outline-none [&>option]:bg-[#1c1c1e]"
                  >
                    <option value="" disabled>
                      {t.notes.fields.budget.placeholder}
                    </option>
                    {t.notes.budgetOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>

          <div className="mt-7 flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={goToPreviousStep}
                className="text-sm text-white/60 transition-colors hover:text-white"
              >
                {t.notes.back}
              </button>
            ) : (
              <span />
            )}

            {isLastStep ? (
              <button
                type="submit"
                disabled={!canSubmitLastStep}
                className="rounded-full bg-[#ffd60a] px-5 py-2 text-sm font-semibold text-[#171410] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {t.notes.submit}
              </button>
            ) : (
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!canAdvance}
                className="rounded-full bg-[#ffd60a] px-5 py-2 text-sm font-semibold text-[#171410] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {t.notes.continueLabel}
              </button>
            )}
          </div>
        </form>
      </div>
    </DesktopAppWindow>
  );
}
