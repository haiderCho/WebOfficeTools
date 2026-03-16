import { FileIcon, defaultStyles, FileIconProps } from 'react-file-icon';

export const TYPE_TO_EXTENSION: Record<string, string> = {
  word: 'docx',
  spreadsheet: 'xlsx',
  slides: 'pptx',

  markdown: 'md',
  table: 'csv',
  latex: 'tex',
  diagram: 'tldr',
};

export function DocumentIcon({ type, className }: { type: string; className?: string }) {
  const extension = TYPE_TO_EXTENSION[type] || 'txt';
  
  // Custom styling for LaTeX and Markdown if not in defaultStyles
  const style = defaultStyles[extension as keyof typeof defaultStyles] || {
    color: '#808080',
    labelColor: '#606060',
  };

  return (
    <div className={className}>
      <FileIcon 
        extension={extension} 
        {...style}
      />
    </div>
  );
}
