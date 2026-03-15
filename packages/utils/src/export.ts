export interface ExportOptions {
  content: string;
  from: 'markdown' | 'html' | 'json' | 'latex' | 'tex';
  to: 'docx' | 'pdf' | 'csv' | 'txt' | 'html';
  filename?: string;
  assets?: { name: string; data: string }[];
}

// Proxy through Next.js API to avoid cross-origin issues
const EXPORT_API_PATH = '/api/export';

/**
 * Sends content to the Pandoc Export Service and triggers a download.
 */
export async function exportDocument(options: ExportOptions) {
  try {
    const response = await fetch(EXPORT_API_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Export failed with status ${response.status}`);
    }

    // Handle the file download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${options.filename || 'document'}.${options.to}`;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);
    
    return true;
  } catch (error) {
    console.error('Export utility error:', error);
    throw error;
  }
}
