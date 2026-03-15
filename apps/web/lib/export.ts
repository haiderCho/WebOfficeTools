export interface ExportOptions {
  content: string;
  from: 'markdown' | 'html' | 'json';
  to: 'docx' | 'pdf' | 'csv' | 'txt' | 'html';
  filename?: string;
}

const EXPORT_SERVICE_URL = process.env.NEXT_PUBLIC_EXPORT_SERVICE_URL || 'http://localhost:3001';

export async function exportDocument(options: ExportOptions) {
  try {
    const response = await fetch(`${EXPORT_SERVICE_URL}/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Export failed');
    }

    // Handle the file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.filename || 'document'}.${options.to}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return true;
  } catch (error) {
    console.error('Export utility error:', error);
    throw error;
  }
}
