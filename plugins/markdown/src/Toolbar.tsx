"use client";

import { Document } from "@opensuite/core";
import { Button } from "@opensuite/ui";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Link as LinkIcon, 
  List, 
  ListOrdered, 
  Quote, 
  Code,
  Image as ImageIcon
} from "lucide-react";

// @ts-ignore
import { ToolbarProps } from "@opensuite/plugin-api";

export default function MarkdownToolbar({ document, onChange, theme }: ToolbarProps) {
  // SimpleMDE has its own toolbar, but we provide this as a placeholder 
  // or for custom actions in the future if needed.
  // For now, we return null to avoid UI clutter, as SimpleMDE handles its own.
  return null;
}
