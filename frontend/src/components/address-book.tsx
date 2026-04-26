"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icon";
import { CopyButton } from "@/components/copy-button";

const STORAGE_KEY = "stellarinsure-address-book";

export type AddressBookCategory = "payout" | "collaborator" | "other";

export interface AddressBookEntry {
  id: string;
  label: string;
  address: string;
  category: AddressBookCategory;
  note?: string;
  createdAt: string;
}

interface AddressBookProps {
  initialEntries?: AddressBookEntry[];
  storage?: Storage | null;
}

interface DraftEntry {
  id: string | null;
  label: string;
  address: string;
  category: AddressBookCategory;
  note: string;
}

const EMPTY_DRAFT: DraftEntry = {
  id: null,
  label: "",
  address: "",
  category: "payout",
  note: "",
};

const CATEGORY_LABELS: Record<AddressBookCategory, string> = {
  payout: "Payout destination",
  collaborator: "Collaborator",
  other: "Other",
};

function isStellarAddress(value: string): boolean {
  const trimmed = value.trim();
  return /^G[A-Z2-7]{55}$/.test(trimmed);
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readFromStorage(storage: Storage | null): AddressBookEntry[] | null {
  if (!storage) {
    return null;
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    return parsed.filter(
      (entry): entry is AddressBookEntry =>
        typeof entry?.id === "string" &&
        typeof entry?.label === "string" &&
        typeof entry?.address === "string",
    );
  } catch {
    return null;
  }
}

export function AddressBook({ initialEntries, storage }: AddressBookProps) {
  const formId = useId();
  const resolvedStorage = useMemo<Storage | null>(() => {
    if (storage !== undefined) {
      return storage;
    }
    if (typeof window === "undefined") {
      return null;
    }
    return window.localStorage;
  }, [storage]);

  const [entries, setEntries] = useState<AddressBookEntry[]>(() => {
    return initialEntries ?? readFromStorage(resolvedStorage) ?? [];
  });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draft, setDraft] = useState<DraftEntry>(EMPTY_DRAFT);
  const [error, setError] = useState<string | null>(null);
  const labelInputRef = useRef<HTMLInputElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!resolvedStorage) {
      return;
    }
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    try {
      resolvedStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota or serialization errors — UI state still updates.
    }
  }, [entries, resolvedStorage]);

  useEffect(() => {
    if (isFormOpen) {
      labelInputRef.current?.focus();
    }
  }, [isFormOpen]);

  function startCreate() {
    setDraft(EMPTY_DRAFT);
    setError(null);
    setIsFormOpen(true);
  }

  function startEdit(entry: AddressBookEntry) {
    setDraft({
      id: entry.id,
      label: entry.label,
      address: entry.address,
      category: entry.category,
      note: entry.note ?? "",
    });
    setError(null);
    setIsFormOpen(true);
  }

  function cancelDraft() {
    setIsFormOpen(false);
    setDraft(EMPTY_DRAFT);
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const label = draft.label.trim();
    const address = draft.address.trim();
    const note = draft.note.trim();

    if (!label) {
      setError("Label is required.");
      return;
    }

    if (!isStellarAddress(address)) {
      setError("Enter a valid Stellar address (starts with G, 56 characters).");
      return;
    }

    const duplicate = entries.find(
      (entry) => entry.address === address && entry.id !== draft.id,
    );
    if (duplicate) {
      setError(`This address is already saved as "${duplicate.label}".`);
      return;
    }

    if (draft.id) {
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === draft.id
            ? {
                ...entry,
                label,
                address,
                category: draft.category,
                note: note || undefined,
              }
            : entry,
        ),
      );
    } else {
      setEntries((prev) => [
        ...prev,
        {
          id: generateId(),
          label,
          address,
          category: draft.category,
          note: note || undefined,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    cancelDraft();
  }

  function handleRemove(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <section className="address-book" aria-labelledby={`${formId}-title`}>
      <div className="address-book__header">
        <div>
          <h2 id={`${formId}-title`} className="settings-section-title">
            Address Book
          </h2>
          <p className="document-upload__empty" style={{ margin: 0 }}>
            Save Stellar addresses for payouts and collaborators so they are
            one click away when submitting policies or claims.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            className="cta-secondary"
            onClick={startCreate}
          >
            <Icon name="plus" size="sm" tone="accent" />
            Add address
          </button>
        )}
      </div>

      {isFormOpen && (
        <form
          className="address-book__form"
          onSubmit={handleSubmit}
          aria-label={draft.id ? "Edit address" : "Add address"}
        >
          <div className="address-book__form-row">
            <label className="field">
              <span className="field__label">Label</span>
              <input
                ref={labelInputRef}
                className="claim-input claim-input--text"
                type="text"
                value={draft.label}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, label: event.target.value }))
                }
                required
                placeholder="e.g. Treasury wallet"
              />
            </label>
            <label className="field">
              <span className="field__label">Category</span>
              <select
                className="tx-select"
                value={draft.category}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    category: event.target.value as AddressBookCategory,
                  }))
                }
              >
                {(Object.keys(CATEGORY_LABELS) as AddressBookCategory[]).map(
                  (key) => (
                    <option key={key} value={key}>
                      {CATEGORY_LABELS[key]}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
          <label className="field">
            <span className="field__label">Stellar address</span>
            <input
              className="claim-input claim-input--text"
              type="text"
              value={draft.address}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, address: event.target.value }))
              }
              required
              placeholder="GABC...XYZ"
              spellCheck={false}
              autoCapitalize="characters"
            />
          </label>
          <label className="field">
            <span className="field__label">Note (optional)</span>
            <input
              className="claim-input claim-input--text"
              type="text"
              value={draft.note}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, note: event.target.value }))
              }
              placeholder="Anything that helps you recognize this address"
            />
          </label>

          {error && (
            <p className="address-book__error" role="alert">
              {error}
            </p>
          )}

          <div className="address-book__form-actions">
            <button
              type="button"
              className="cta-secondary"
              onClick={cancelDraft}
            >
              Cancel
            </button>
            <button type="submit" className="cta-primary">
              {draft.id ? "Save changes" : "Add address"}
            </button>
          </div>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="address-book__empty">
          You haven&rsquo;t saved any addresses yet.
        </p>
      ) : (
        <ul className="address-book__list" aria-label="Saved addresses">
          {entries.map((entry) => (
            <li key={entry.id} className="address-book__item">
              <div className="address-book__item-meta">
                <span className="address-book__item-label">
                  {entry.label}
                  <span className="address-book__item-tag">
                    {CATEGORY_LABELS[entry.category]}
                  </span>
                </span>
                <span className="address-book__item-address">
                  {entry.address}
                </span>
                {entry.note && (
                  <span className="address-book__item-note">{entry.note}</span>
                )}
              </div>
              <div className="address-book__item-actions">
                <CopyButton
                  value={entry.address}
                  label={`Copy ${entry.label} address`}
                  size="sm"
                />
                <button
                  type="button"
                  className="copy-button copy-button--icon copy-button--sm"
                  onClick={() => startEdit(entry)}
                  aria-label={`Edit ${entry.label}`}
                >
                  <Icon name="edit" size="sm" tone="muted" />
                </button>
                <button
                  type="button"
                  className="copy-button copy-button--icon copy-button--sm"
                  onClick={() => handleRemove(entry.id)}
                  aria-label={`Remove ${entry.label}`}
                >
                  <Icon name="trash" size="sm" tone="muted" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
