const removeMarkdownDecorators = (markdownText: string): string => {
  // Remove Markdown decorators like bold, italic, and strikethrough
  
  // Order matters here. The more specific regex should come before the general one.
  markdownText = markdownText.replace(/(\*\*\*\*|____)(.*?)(\*\*\*\*|____)/g, '$2')
                             .replace(/(\*\*\*|___)(.*?)(\*\*\*|___)/g, '$2')
                             .replace(/(\*\*|__)(.*?)(\*\*|__)/g, '$2')
                             .replace(/(\*|_)(.*?)(\*|_)/g, '$2')
                             .replace(/(~~)(.*?)(~~)/g, '$2')
                             .replace(/^#+\s+/gm, '');

  return markdownText.trim();
};

export default removeMarkdownDecorators;
