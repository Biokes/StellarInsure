export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FileValidationOptions {
  acceptedTypes?: string[];
  maxSizeBytes?: number;
  minSizeBytes?: number;
  maxFiles?: number;
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {},
): FileValidationResult {
  const errors: string[] = [];
  const { acceptedTypes, maxSizeBytes, minSizeBytes } = options;

  if (acceptedTypes && acceptedTypes.length > 0) {
    const isAccepted = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.endsWith("/*")) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAccepted) {
      const exts = acceptedTypes
        .filter((t) => t.startsWith("."))
        .map((t) => t.toUpperCase());
      const types = acceptedTypes
        .filter((t) => !t.startsWith("."))
        .join(", ");

      if (exts.length > 0 && types) {
        errors.push(
          `Invalid file type. Accepted: ${[...exts, types].join(", ")}`,
        );
      } else if (exts.length > 0) {
        errors.push(`Invalid file type. Accepted: ${exts.join(", ")}`);
      } else {
        errors.push(`Invalid file type. Accepted: ${types}`);
      }
    }
  }

  if (maxSizeBytes !== undefined && file.size > maxSizeBytes) {
    errors.push(
      `File "${file.name}" exceeds the ${formatBytes(maxSizeBytes)} limit.`,
    );
  }

  if (minSizeBytes !== undefined && file.size < minSizeBytes) {
    errors.push(
      `File "${file.name}" is below the ${formatBytes(minSizeBytes)} minimum.`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateFiles(
  files: File[],
  options: FileValidationOptions,
): FileValidationResult {
  const allErrors: string[] = [];
  const validFiles: File[] = [];

  const { maxFiles } = options;

  for (const file of files) {
    const result = validateFile(file, options);
    if (result.isValid) {
      validFiles.push(file);
    }
    allErrors.push(...result.errors);
  }

  if (maxFiles !== undefined && validFiles.length > maxFiles) {
    allErrors.push(
      `Only ${maxFiles} file${maxFiles === 1 ? "" : "s"} allowed.`,
    );
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

export function formatBytes(bytes: number): string {
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

export function getFileTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "image/*": "Images",
    "video/*": "Videos",
    "audio/*": "Audio",
    "application/pdf": "PDF documents",
    ".pdf": "PDF documents",
    ".jpg": "JPEG images",
    ".jpeg": "JPEG images",
    ".png": "PNG images",
    ".gif": "GIF images",
    ".doc": "Word documents",
    ".docx": "Word documents",
    ".xls": "Excel spreadsheets",
    ".xlsx": "Excel spreadsheets",
  };

  return labels[type] || type;
}

export function getAcceptedFileTypes(options: FileValidationOptions): string {
  return options.acceptedTypes?.join(", ") || "";
}