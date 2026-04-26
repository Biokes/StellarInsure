"use client";

import React, { useCallback, useId, useMemo, useState } from "react";
import { Icon } from "./icon";

export interface Policy {
  id: string;
  name: string;
  type?: string;
  coverage?: string;
  status?: string;
}

export interface PolicySelectorProps {
  policies: Policy[];
  value?: Policy | null;
  onChange?: (policy: Policy | null) => void;
  placeholder?: string;
  label?: string;
  allowClear?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

export function PolicySelector({
  policies,
  value,
  onChange,
  placeholder = "Search policies...",
  label = "Select Policy",
  allowClear = true,
  disabled = false,
  searchPlaceholder = "Search...",
}: PolicySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const listId = useId();
  const inputId = useId();

  const filteredPolicies = useMemo(() => {
    if (!search) return policies;
    const lower = search.toLowerCase();
    return policies.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.type?.toLowerCase().includes(lower) ||
        p.id.toLowerCase().includes(lower),
    );
  }, [policies, search]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    if (!isOpen) setSearch("");
  }, [disabled, isOpen]);

  const handleSelect = useCallback(
    (policy: Policy) => {
      onChange?.(policy);
      setIsOpen(false);
      setSearch("");
    },
    [onChange],
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(null);
    },
    [onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearch("");
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleToggle();
      }
    },
    [handleToggle],
  );

  return (
    <div className="policy-selector">
      <label id={inputId} className="policy-selector__label">
        {label}
      </label>
      <div
        className={`policy-selector__trigger ${isOpen ? "policy-selector__trigger--open" : ""} ${disabled ? "policy-selector__trigger--disabled" : ""}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-controls={listId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        {value ? (
          <div className="policy-selector__value">
            <span className="policy-selector__value-name">{value.name}</span>
            {value.type && (
              <span className="policy-selector__value-type">{value.type}</span>
            )}
          </div>
        ) : (
          <span className="policy-selector__placeholder">{placeholder}</span>
        )}
        <div className="policy-selector__actions">
          {allowClear && value && (
            <button
              type="button"
              className="policy-selector__clear"
              onClick={handleClear}
              aria-label="Clear selection"
            >
              <Icon name="x" size="sm" tone="muted" />
            </button>
          )}
          <Icon
            name={isOpen ? "chevron-up" : "chevron-down"}
            size="sm"
            tone="muted"
          />
        </div>
      </div>

      {isOpen && (
        <div className="policy-selector__dropdown">
          <div className="policy-selector__search">
            <Icon name="search" size="sm" tone="muted" />
            <input
              type="text"
              className="policy-selector__search-input"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <ul
            id={listId}
            className="policy-selector__list"
            role="listbox"
            aria-labelledby={inputId}
          >
            {filteredPolicies.length === 0 ? (
              <li className="policy-selector__empty">
                No policies found.
              </li>
            ) : (
              filteredPolicies.map((policy) => (
                <li
                  key={policy.id}
                  className={`policy-selector__option ${
                    value?.id === policy.id
                      ? "policy-selector__option--selected"
                      : ""
                  }`}
                  onClick={() => handleSelect(policy)}
                  role="option"
                  aria-selected={value?.id === policy.id}
                >
                  <div className="policy-selector__option-content">
                    <span className="policy-selector__option-name">
                      {policy.name}
                    </span>
                    {policy.type && (
                      <span className="policy-selector__option-type">
                        {policy.type}
                      </span>
                    )}
                  </div>
                  {policy.coverage && (
                    <span className="policy-selector__option-coverage">
                      {policy.coverage}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}