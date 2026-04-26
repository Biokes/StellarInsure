"use client";

import React, { useCallback, useId, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icon";

export type DocumentUploadStatus = "pending" | "uploading" | "complete" | "error";

export interface UploadedDocument {
  id: string;
  file: File;
  status: DocumentUploadStatus;
  progress: number;
  errorMessage?: string;
}

interface DocumentUploadProps {
  label?: string;
  hint?: string;
  accept?: string;
  multiple?: boolean;
  maxFileSizeBytes?: number;
  maxFiles?: number;
  disabled?: boolean;
  files?: UploadedDocument[];
  onFilesAdded?: (files: File[]) => void;
  onRemove?: (id: string) => void;
  emptyLabel?: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function createDocument(file: File): UploadedDocument {
  return {
    id: generateId(),
    file,
    status: "pending",
    progress: 0,
  };
}

export function DocumentUpload({
  label = "Upload supporting documents",
  hint = "Drag and drop files here, or click to browse.",
  accept,
  multiple = true,
  maxFileSizeBytes,
  maxFiles,
  disabled = false,
  files = [],
  onFilesAdded,
  onRemove,
  emptyLabel = "No files added yet.",
}: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const remainingSlots = useMemo(() => {
    if (typeof maxFiles !== "number") {
      return Number.POSITIVE_INFINITY;
    }
    return Math.max(0, maxFiles - files.length);
  }, [files.length, maxFiles]);

  const acceptedTypes = useMemo(() => {
    if (!accept) {
      return null;
    }
    return accept
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean);
  }, [accept]);

  const isFileAccepted = useCallback(
    (file: File): boolean => {
      if (!acceptedTypes) {
        return true;
      }
      const fileName = file.name.toLowerCase();
      const fileType = file.type.toLowerCase();
      return acceptedTypes.some((token) => {
        if (token.startsWith(".")) {
          return fileName.endsWith(token);
        }
        if (token.endsWith("/*")) {
          return fileType.startsWith(token.slice(0, -1));
        }
        return fileType === token;
      });
    },
    [acceptedTypes],
  );

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (disabled) {
        return;
      }

      const list = Array.from(incoming);
      if (list.length === 0) {
        return;
      }

      const errors: string[] = [];
      const accepted: File[] = [];

      for (const file of list) {
        if (!isFileAccepted(file)) {
          errors.push(`${file.name} is not a supported file type.`);
          continue;
        }
        if (
          typeof maxFileSizeBytes === "number" &&
          file.size > maxFileSizeBytes
        ) {
          errors.push(
            `${file.name} exceeds the ${formatBytes(maxFileSizeBytes)} limit.`,
          );
          continue;
        }
        if (accepted.length >= remainingSlots) {
          errors.push(`Only ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed.`);
          break;
        }
        accepted.push(file);
      }

      setValidationError(errors[0] ?? null);

      if (accepted.length > 0) {
        onFilesAdded?.(accepted);
      }
    },
    [disabled, isFileAccepted, maxFileSizeBytes, maxFiles, onFilesAdded, remainingSlots],
  );

  function openFilePicker() {
    if (disabled) {
      return;
    }
    inputRef.current?.click();
  }

  function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer?.files) {
      handleFiles(event.dataTransfer.files);
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
    event.target.value = "";
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLLabelElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  }

  const dropzoneClass = [
    "document-upload__dropzone",
    isDragging ? "document-upload__dropzone--active" : "",
    disabled ? "document-upload__dropzone--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="document-upload">
      <label
        htmlFor={inputId}
        className={dropzoneClass}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-disabled={disabled}
      >
        <Icon name="upload" size="lg" tone="accent" />
        <span className="document-upload__dropzone-title">{label}</span>
        <span className="document-upload__dropzone-hint">{hint}</span>
        <input
          ref={inputRef}
          id={inputId}
          className="document-upload__dropzone-input"
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleChange}
        />
      </label>

      {validationError && (
        <p className="document-upload__error" role="alert">
          {validationError}
        </p>
      )}

      {files.length === 0 ? (
        <p className="document-upload__empty">{emptyLabel}</p>
      ) : (
        <ul className="document-upload__list" aria-label="Uploaded files">
          {files.map((doc) => {
            const isError = doc.status === "error";
            const isUploading = doc.status === "uploading";
            const itemClass = `document-upload__item ${
              isError ? "document-upload__item--error" : ""
            }`.trim();

            return (
              <li key={doc.id} className={itemClass}>
                <Icon
                  name="document"
                  size="md"
                  tone={isError ? "danger" : "muted"}
                />
                <div className="document-upload__item-meta">
                  <span className="document-upload__item-name">
                    {doc.file.name}
                  </span>
                  <span className="document-upload__item-size">
                    {formatBytes(doc.file.size)}
                    {doc.status === "complete" ? " · Uploaded" : ""}
                  </span>
                  {isUploading && (
                    <div
                      className="document-upload__progress"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(doc.progress)}
                    >
                      <div
                        className="document-upload__progress-bar"
                        style={{ transform: `scaleX(${Math.min(1, doc.progress / 100)})` }}
                      />
                    </div>
                  )}
                  {isError && doc.errorMessage && (
                    <span className="document-upload__item-error">
                      {doc.errorMessage}
                    </span>
                  )}
                </div>
                {onRemove && (
                  <button
                    type="button"
                    className="document-upload__remove"
                    onClick={() => onRemove(doc.id)}
                    aria-label={`Remove ${doc.file.name}`}
                  >
                    <Icon name="trash" size="sm" tone="muted" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
