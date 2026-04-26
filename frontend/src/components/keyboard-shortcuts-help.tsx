"use client";

import { useEffect, useMemo, useState } from "react";

type ShortcutGroup = {
  title: string;
  items: Array<{
    keys: string;
    action: string;
  }>;
};

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }

      if (isTypingTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const shortcuts = useMemo<ShortcutGroup[]>(
    () => [
      {
        title: "Navigation",
        items: [
          { keys: "Ctrl/Cmd + K", action: "Open or close quick navigation palette" },
          { keys: "Enter", action: "Run selected quick action in palette" },
        ],
      },
      {
        title: "Accessibility",
        items: [
          { keys: "?", action: "Open keyboard shortcuts help (outside text fields)" },
          { keys: "Esc", action: "Close open modal, drawer, or command palette" },
          { keys: "Tab / Shift + Tab", action: "Move focus forward or backward" },
        ],
      },
    ],
    [],
  );

  return (
    <>
      <button
        className="cta-secondary"
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open keyboard shortcuts help"
      >
        Keyboard Help
      </button>
      {open ? (
        <div className="ks-backdrop" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts help">
          <div className="ks-panel">
            <header className="ks-header">
              <h3>Keyboard shortcuts</h3>
              <button
                type="button"
                className="topbar-action-btn"
                onClick={() => setOpen(false)}
                aria-label="Close keyboard shortcuts help"
              >
                Close
              </button>
            </header>
            <div className="ks-groups">
              {shortcuts.map((group) => (
                <section className="ks-group" key={group.title} aria-label={`${group.title} shortcuts`}>
                  <h4>{group.title}</h4>
                  <ul>
                    {group.items.map((item) => (
                      <li key={`${group.title}-${item.keys}`}>
                        <kbd>{item.keys}</kbd>
                        <span>{item.action}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
