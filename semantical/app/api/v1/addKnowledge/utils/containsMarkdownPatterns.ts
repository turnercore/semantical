/**
 * Determines if a given text contains Markdown-specific syntax patterns.
 * 
 * @param textContent The text content to be analyzed for Markdown patterns.
 * @returns True if Markdown patterns are found, false otherwise.
 */
const containsMarkdownPatterns = (textContent: string): boolean => {
  // Define an array of Regular Expressions for common Markdown elements
  const markdownPatterns: RegExp[] = [
    /^#\s+/gm,                // headers
    /\*\*[\w\s]+\*\*/gm,      // bold
    /\*[\w\s]+\*/gm,          // italic
    /\[.+\]\(.+\)/gm,         // links
    /^\s*-[\s\w]+/gm,         // unordered lists
    /^\s*\d+\.[\s\w]+/gm,     // ordered lists
    /```[\s\S]*?```/gm,       // code blocks
    /^\s*>[\s\w]+/gm,         // blockquotes
    /\!\[.*\]\(.*\)/gm,       // images
    /~~[\w\s]+~~/gm,          // strikethrough
    /__[\w\s]+__/gm           // underline (double underscore)
  ]

  // Test the text content against each pattern
  return markdownPatterns.some(pattern => pattern.test(textContent))
}

// Export the function for use in other files
export default containsMarkdownPatterns
