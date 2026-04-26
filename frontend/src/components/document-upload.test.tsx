import React, { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  DocumentUpload,
  type UploadedDocument,
  createDocument,
} from "./document-upload";

function makeFile(name: string, size: number, type = "application/pdf"): File {
  const file = new File(["a".repeat(size)], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function ControlledHarness(props: {
  maxFileSizeBytes?: number;
  accept?: string;
  maxFiles?: number;
  initial?: UploadedDocument[];
}) {
  const [files, setFiles] = useState<UploadedDocument[]>(props.initial ?? []);
  return (
    <DocumentUpload
      {...props}
      files={files}
      onFilesAdded={(added) => setFiles((prev) => [...prev, ...added.map(createDocument)])}
      onRemove={(id) => setFiles((prev) => prev.filter((doc) => doc.id !== id))}
    />
  );
}

describe("DocumentUpload", () => {
  it("renders empty state and the upload prompt", () => {
    render(<ControlledHarness />);

    expect(screen.getByText("No files added yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Upload supporting documents"),
    ).toBeInTheDocument();
  });

  it("adds files chosen via the file input", async () => {
    const user = userEvent.setup();
    render(<ControlledHarness />);

    const input = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    await user.upload(input, makeFile("policy.pdf", 1024));

    expect(screen.getByText("policy.pdf")).toBeInTheDocument();
  });

  it("rejects files larger than the size limit and surfaces an error", async () => {
    const user = userEvent.setup();
    render(<ControlledHarness maxFileSizeBytes={500} />);

    const input = document.querySelector(
      "input[type='file']",
    ) as HTMLInputElement;
    await user.upload(input, makeFile("big.pdf", 1024));

    expect(screen.getByRole("alert")).toHaveTextContent(/big.pdf exceeds/i);
    expect(screen.queryByText("big.pdf", { selector: ".document-upload__item-name" })).not.toBeInTheDocument();
  });

  it("removes a file when the remove button is clicked", async () => {
    const user = userEvent.setup();
    const initial = [createDocument(makeFile("evidence.png", 200, "image/png"))];
    render(<ControlledHarness initial={initial} />);

    const list = screen.getByRole("list", { name: "Uploaded files" });
    const removeButton = within(list).getByRole("button", {
      name: /Remove evidence.png/i,
    });
    await user.click(removeButton);

    expect(screen.queryByText("evidence.png")).not.toBeInTheDocument();
  });

  it("shows progress bar while uploading", () => {
    const initial: UploadedDocument[] = [
      {
        id: "1",
        file: makeFile("uploading.pdf", 1024),
        status: "uploading",
        progress: 42,
      },
    ];
    render(<ControlledHarness initial={initial} />);

    const progress = screen.getByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuenow", "42");
  });

  it("invokes onFilesAdded with accepted files on drop", async () => {
    const onFilesAdded = vi.fn();
    render(
      <DocumentUpload files={[]} onFilesAdded={onFilesAdded} accept=".pdf" />,
    );

    const dropzone = screen.getByRole("button", {
      name: /Upload supporting documents/i,
    });
    const file = makeFile("dropped.pdf", 100);

    const dataTransfer = {
      files: [file],
      items: [],
      types: ["Files"],
    } as unknown as DataTransfer;

    const event = new Event("drop", { bubbles: true }) as unknown as DragEvent;
    Object.defineProperty(event, "dataTransfer", { value: dataTransfer });
    dropzone.dispatchEvent(event);

    expect(onFilesAdded).toHaveBeenCalledWith([file]);
  });
});
