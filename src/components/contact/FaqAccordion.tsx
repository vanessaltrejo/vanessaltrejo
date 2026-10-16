"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { siteContent, type FaqItemCopy } from "@/lib/site-content";

function PlusMinusIcon({ isOpen }: { isOpen: boolean }) {
  return isOpen ? (
    <svg width="12" height="12" viewBox="0 0 14 2" fill="none" aria-hidden="true">
      <path d="M1 1h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M7 1v12M1 7h12"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FaqAccordionItem({
  item,
  isOpen,
  onToggle,
}: {
  item: FaqItemCopy;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const hasMountedRef = useRef(false);

  // GSAP's height:"auto" support measures the panel itself, no manual
  // scrollHeight tracking needed.
  useGSAP(
    () => {
      const panelState = { height: isOpen ? "auto" : 0 };
      const iconState = { rotate: isOpen ? 180 : 0 };

      // The first run only syncs the starting state, so the item that is
      // open by default shows open on load instead of animating open.
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        gsap.set(panelRef.current, panelState);
        gsap.set(iconRef.current, iconState);
        return;
      }

      gsap.to(panelRef.current, {
        ...panelState,
        duration: 0.4,
        ease: "power3.inOut",
      });
      gsap.to(iconRef.current, {
        ...iconState,
        duration: 0.4,
        ease: "power3.inOut",
      });
    },
    { dependencies: [isOpen], scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-2xl border border-neutral-200 transition-colors hover:border-neutral-400"
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-[15px] font-medium tracking-tight text-secondary">
          {item.question}
        </span>
        <span
          ref={iconRef}
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-secondary"
        >
          <PlusMinusIcon isOpen={isOpen} />
        </span>
      </button>

      {/* Server-rendered already at its starting height, so an item that is
          open by default doesn't pop open when the page hydrates. */}
      <div
        ref={panelRef}
        className={`overflow-hidden ${isOpen ? "h-auto" : "h-0"}`}
      >
        <p className="px-5 pb-5 text-sm leading-6 text-neutral-600">{item.answer}</p>
      </div>
    </div>
  );
}

// The first question starts open so the column doesn't read as empty.
const DEFAULT_OPEN_INDEX = 0;

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(DEFAULT_OPEN_INDEX);

  return (
    <div className="flex flex-col gap-2.5">
      {siteContent.faq.items.map((item, index) => (
        <FaqAccordionItem
          key={item.question}
          item={item}
          isOpen={openIndex === index}
          onToggle={() =>
            setOpenIndex((current) => (current === index ? null : index))
          }
        />
      ))}
    </div>
  );
}
