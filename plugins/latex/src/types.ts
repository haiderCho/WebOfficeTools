export interface LaTeXSnippet {
  id: string;
  label: string;
  snippet: string;
  description?: string;
}

export interface LaTeXOutlineItem {
  id: string;
  title: string;
  level: number;
  line: number;
}
