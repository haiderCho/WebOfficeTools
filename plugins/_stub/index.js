import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createDocument } from "@opensuite/core";
// =============================================================================
// Stub Plugin — development placeholder for Phase 0 verification
// Delete after Phase 1 is implemented
// =============================================================================
function StubEditor({ document }) {
    return (_jsx("div", { className: "flex-1 flex items-center justify-center p-8", children: _jsxs("div", { className: "text-center space-y-4 max-w-md", children: [_jsx("div", { className: "text-6xl", children: "\uD83D\uDCDD" }), _jsx("h2", { className: "text-xl font-semibold text-gray-700 dark:text-gray-300", children: "Editor Plugin Loaded" }), _jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Document: ", _jsx("span", { className: "font-mono", children: document.title })] }), _jsx("p", { className: "text-xs text-gray-400 dark:text-gray-500", children: "This is a stub plugin. The real Word editor will replace this in Phase 1." })] }) }));
}
function StubToolbar(_props) {
    return (_jsx("div", { className: "flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900", children: _jsx("span", { className: "text-xs text-gray-400", children: "Toolbar will load here (Phase 1)" }) }));
}
export const plugin = {
    id: "stub",
    name: "Stub (Development)",
    icon: "FileQuestion",
    documentType: "word",
    version: "0.0.1",
    blocks: [],
    createDocument: (title) => createDocument("word", title),
    loadDocument: (raw) => raw,
    saveDocument: (doc) => doc,
    Editor: StubEditor,
    Toolbar: StubToolbar,
    commands: {},
    keymap: {},
    exporters: {},
    capabilities: {},
};
//# sourceMappingURL=index.js.map