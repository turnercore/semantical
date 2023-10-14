import { ProcessMarkdownOptions } from '@/types';

const stripMarkdown = (
  markdownText: string,
  options: ProcessMarkdownOptions =
  {
    overlap: 0.1,
    tokenLimit: 10,
    includeBreadcrumbs: true,
    removeDecorators: true,
    removeLinks: true,
    removeImages: true,
    removeCodeBlocks: false,
    removeBlockquotes: false,
    removeTables: false,
    removeLists: false,
    removeFootnotes: false,
    removeAbbreviations: false,
    removeEmojis: false
  }): string => {
    
  // Remove hyperlinks
  if (options.removeLinks) {
    markdownText = markdownText.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  }

  // Remove images
  if (options.removeImages) {
    markdownText = markdownText.replace(/!\[.*?\]\(.*?\)/g, '');
  }

  // Remove code blocks
  if (options.removeCodeBlocks) {
    markdownText = markdownText.replace(/```.*?```/gs, '');
  }

  // Remove blockquotes
  if (options.removeBlockquotes) {
    markdownText = markdownText.replace(/^>.*?$/gm, '');
  }

  // Remove tables (be cautious, this is a simple approach)
  if (options.removeTables) {
    markdownText = markdownText.replace(/(\|.*\|\r?\n?)+/g, '');
  }

  // Remove lists
  if (options.removeLists) {
    markdownText = markdownText.replace(/(-|\*|\+|\d+\.)\s+.*\r?\n?/gm, '');
  }

  // Remove footnotes
  if (options.removeFootnotes) {
    markdownText = markdownText.replace(/\[\^.*?\]/g, '');
  }

  // Remove abbreviations
  if (options.removeAbbreviations) {
    markdownText = markdownText.replace(/\*\[(.*?)\]\:\s*.*\r?\n?/gm, '');
  }

  // Remove emojis
  if (options.removeEmojis) {
    markdownText = markdownText.replace(/:\w+:/g, '');
  }

  return markdownText.trim();
}

export default stripMarkdown;