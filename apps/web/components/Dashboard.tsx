"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDocumentStore } from "../store/documentStore";
import { formatRelativeTime, capitalize } from "@opensuite/utils";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@opensuite/ui";
import { DocumentIcon } from "../lib/iconUtils";


const DOC_TYPES = [
  {
    type: "word",
    label: "Document",
    icon: "/icons/doc.svg",
    description: "Rich text document",
  },
  {
    type: "spreadsheet",
    label: "Spreadsheet",
    icon: "/icons/xlsx.svg",
    description: "Tables & formulas",
  },
  {
    type: "slides",
    label: "Presentation",
    icon: "/icons/pptx.svg",
    description: "Slide deck",
  },

  {
    type: "markdown",
    label: "Markdown",
    icon: "/icons/doc.svg",
    description: "Plain text markup",
  },
  {
    type: "latex",
    label: "LaTeX",
    icon: "/icons/doc.svg",
    description: "Scientific documents",
  },
  {
    type: "diagram",
    label: "Diagram Studio",
    icon: "/icons/diagram.svg",
    description: "Flowcharts & wireframes",
  },
  {
    type: "table",
    label: "Table Builder",
    icon: "/icons/csv.svg",
    description: "Custom flexible tables",
  },
] as const;

export function Dashboard() {
  const router = useRouter();
  const {
    documents,
    isLoading,
    createDocument,
    renameDocument,
    deleteDocument,
  } = useDocumentStore();
  const [creating, setCreating] = useState(false);

  const handleCreate = async (type: string) => {
    if (creating) return;
    setCreating(true);
    try {
      const doc = await createDocument(type, "Untitled");
      router.push(`/editor/${doc.id}`);
    } catch {
      // Error handled by store
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to OpenSuite
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Create or open a document to get started.
        </p>
      </div>

      {/* New Document Grid */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          New Document
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {DOC_TYPES.map((dt) => (
            <button
              key={dt.type}
              onClick={() => handleCreate(dt.type)}
              disabled={creating}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all bg-white dark:bg-gray-900 disabled:opacity-50"
            >
              <DocumentIcon type={dt.type} className="w-8 h-8" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">

                {dt.label}
              </span>
              <span className="text-xs text-gray-400">{dt.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Recent Documents */}
      <section>
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Recent Documents
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            <div className="text-4xl mb-3">📂</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No documents yet. Create one above!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {documents
              .sort(
                (a, b) =>
                  new Date(b.updatedAt).getTime() -
                  new Date(a.updatedAt).getTime(),
              )
              .map((doc) => (
                <div
                  key={doc.id}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left group"
                >
                  <button
                    onClick={() => router.push(`/editor/${doc.id}`)}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <span className="shrink-0 flex items-center justify-center">
                      <DocumentIcon type={doc.type} className="w-6 h-6" />
                    </span>

                    <div className="min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                        {doc.title || "Untitled"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {capitalize(doc.type)} ·{" "}
                        {formatRelativeTime(doc.updatedAt)}
                      </p>
                    </div>
                  </button>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity shrink-0">
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newTitle = window.prompt(
                          "Enter new title:",
                          doc.title,
                        );
                        if (newTitle && newTitle !== doc.title) {
                          renameDocument(doc.id, newTitle);
                        }
                      }}
                      title="Rename"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Are you sure you want to delete this document?",
                          )
                        ) {
                          deleteDocument(doc.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
