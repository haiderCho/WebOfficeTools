import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createDocument } from "@opensuite/core";
import { PlusCircle, Columns, Rows, Trash2, Settings, Save, Layout } from "lucide-react";
import { nanoid } from "nanoid";
// =============================================================================
// Table Builder Editor
// =============================================================================
function TableEditor({ document, onChange }) {
    const block = document.blocks[0];
    if (!block || block.type !== "table-graph")
        return null;
    const props = block.props;
    const { columns, cells } = props;
    const addCell = (columnId) => {
        const newCell = {
            id: nanoid(),
            columnId,
            content: "New Cell",
        };
        onChange({
            ...document,
            blocks: [{
                    ...block,
                    props: {
                        ...props,
                        cells: [...cells, newCell]
                    }
                }]
        });
    };
    const editCell = (cellId, content) => {
        const nextCells = cells.map(c => c.id === cellId ? { ...c, content } : c);
        onChange({
            ...document,
            blocks: [{
                    ...block,
                    props: {
                        ...props,
                        cells: nextCells
                    }
                }]
        });
    };
    return (_jsx("div", { className: "flex-1 flex flex-col p-8 bg-gray-50 dark:bg-gray-900 overflow-auto", children: _jsxs("div", { className: "max-w-6xl mx-auto w-full space-y-6", children: [_jsx("div", { className: "bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 overflow-hidden", children: _jsx("div", { className: "overflow-x-auto pb-4", children: columns.length === 0 ? (_jsx("div", { className: "text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg", children: _jsx("p", { className: "text-gray-500", children: "No columns yet. Use the toolbar to add one." }) })) : (_jsx("div", { className: "flex gap-4 min-w-max", children: columns.map((col) => (_jsxs("div", { className: "w-56 space-y-3", children: [_jsxs("div", { className: "group relative p-3 bg-gray-100 dark:bg-gray-700 rounded-md font-semibold text-center text-sm border border-transparent hover:border-blue-400 transition-all", children: [_jsxs("span", { className: "truncate block", children: ["Column ", col.id.slice(0, 4)] }), _jsx("button", { className: "absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full shadow-lg transition-opacity", children: _jsx(Trash2, { size: 10 }) })] }), _jsx("div", { className: "space-y-2", children: cells
                                            .filter((c) => c.columnId === col.id)
                                            .map((cell) => (_jsx("div", { className: "group relative p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm text-sm hover:ring-2 hover:ring-blue-500/50 transition-all", children: _jsx("textarea", { className: "w-full bg-transparent border-none focus:ring-0 resize-none p-0", value: cell.content, onChange: (e) => editCell(cell.id, e.target.value), rows: 1 }) }, cell.id))) }), _jsxs("button", { onClick: () => addCell(col.id), className: "w-full py-2 text-xs border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-all flex items-center justify-center gap-1", children: [_jsx(PlusCircle, { size: 14 }), " Add Item"] })] }, col.id))) })) }) }), _jsxs("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg flex gap-3 items-start", children: [_jsx(Settings, { className: "text-blue-600 dark:text-blue-400 mt-0.5", size: 16 }), _jsxs("p", { className: "text-xs text-blue-800 dark:text-blue-200 leading-relaxed", children: [_jsx("strong", { children: "Pro Tip:" }), " Independent stacks allow you to build asymmetrical layouts. Perfect for Kanban boards, feature comparisons, or structured research notes."] })] })] }) }));
}
function TableToolbar({ document, onChange }) {
    const block = document.blocks[0];
    if (!block || block.type !== "table-graph")
        return _jsx("div", { className: "h-12 border-b" });
    const props = block.props;
    const addColumn = () => {
        const newCol = { id: nanoid(), width: 220 };
        onChange({
            ...document,
            blocks: [{
                    ...block,
                    props: {
                        ...props,
                        columns: [...props.columns, newCol]
                    }
                }]
        });
    };
    return (_jsxs("div", { className: "flex items-center gap-4 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 sticky top-0 z-10", children: [_jsxs("div", { className: "flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-4", children: [_jsx(Layout, { size: 16, className: "text-gray-400 mr-1" }), _jsxs("select", { className: "text-xs bg-transparent border-none focus:ring-0 font-medium cursor-pointer", children: [_jsx("option", { children: "Independent Stacks" }), _jsx("option", { children: "Strict Grid" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(IconButton, { icon: _jsx(Columns, { size: 18 }), label: "Add Column", onClick: addColumn }), _jsx(IconButton, { icon: _jsx(Rows, { size: 18 }), label: "Add Global Row", disabled: true })] }), _jsx("div", { className: "ml-auto flex items-center gap-2", children: _jsx(IconButton, { icon: _jsx(Save, { size: 18 }), label: "Export PDF" }) })] }));
}
function IconButton({ icon, label, onClick, disabled }) {
    return (_jsxs("button", { onClick: onClick, disabled: disabled, title: label, className: "p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed group relative transition-colors", children: [icon, _jsx("span", { className: "absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50", children: label })] }));
}
export const plugin = {
    id: "table-builder",
    name: "Table Builder",
    icon: "Grid",
    documentType: "table",
    version: "0.1.0",
    blocks: ["table-graph"],
    createDocument: (title) => {
        const doc = createDocument("table", title);
        doc.blocks = [
            {
                id: nanoid(),
                type: "table-graph",
                props: { columns: [], cells: [] },
                content: [],
                children: [],
            },
        ];
        return doc;
    },
    loadDocument: (raw) => raw,
    saveDocument: (doc) => doc,
    Editor: TableEditor,
    Toolbar: TableToolbar,
    commands: {},
    keymap: {},
    exporters: {
        pdf: {
            format: "pdf",
            label: "Printable PDF",
        },
    },
    capabilities: {
        aiPrompt: true,
    },
};
//# sourceMappingURL=index.js.map