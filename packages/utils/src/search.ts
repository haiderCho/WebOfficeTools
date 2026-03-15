/**
 * Recursively extracts all searchable text from a document's blocks.
 * This is "future-proof" as it crawls any generic object structure for strings.
 */
export function crawlDocument(doc: any): string {
  const content: string[] = [];

  // 1. Add top-level metadata
  if (doc.title) content.push(doc.title);
  if (doc.metadata?.author) content.push(doc.metadata.author);
  if (doc.metadata?.tags) content.push(...doc.metadata.tags);

  // 2. Deep crawl blocks
  if (Array.isArray(doc.blocks)) {
    doc.blocks.forEach((block: any) => {
      // Crawl the entire props object of each block
      if (block.props) {
        content.push(extractStrings(block.props));
      }
    });
  }

  return content.join(' ').toLowerCase();
}

/**
 * Recursively extracts all strings from an object or array.
 */
function extractStrings(obj: any): string {
  if (typeof obj === 'string') return obj;
  if (!obj || typeof obj !== 'object') return '';

  return Object.values(obj)
    .map(value => {
      if (typeof value === 'string') return value;
      if (typeof value === 'object') return extractStrings(value);
      return '';
    })
    .join(' ');
}

/**
 * Performs a lightweight fuzzy search on a list of documents.
 */
export function searchDocuments(query: string, docs: any[]): any[] {
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const searchTerms = normalizedQuery.split(/\s+/);

  return docs
    .map(doc => {
      const docText = crawlDocument(doc);
      
      // Calculate a basic score based on term matches
      let score = 0;
      let matchedCount = 0;

      searchTerms.forEach(term => {
        if (docText.includes(term)) {
          matchedCount++;
          // Higher bias for title matches
          if (doc.title?.toLowerCase().includes(term)) {
            score += 10;
          } else {
            score += 5;
          }
        }
      });

      return { doc, score, matchedCount };
    })
    .filter(result => result.matchedCount > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.doc);
}
