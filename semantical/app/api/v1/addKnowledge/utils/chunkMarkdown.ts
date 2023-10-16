import type { ProcessMarkdownOptions } from "@/types"
import getTokenCount from "./getTokenCount"
import stripMarkdown from "./stripMarkdown"
import removeMarkdownDecorators from "./removeMarkdownDecorators"


function splitLargeChunk(content: string, breadcrumbTokens: number, options: ProcessMarkdownOptions): string[] {
  const tokenLimit = options.tokenLimit || 512
  
  // Ensure overlap is within acceptable bounds.
  let overlap = options.overlap || 0.1
  if (overlap <= 0 || overlap >= 1) {
    overlap = 0.1 // Fallback to a default value if out of bounds
  }

  const contentTokens = content.split(' ')
  let start = 0
  const subChunks: string[] = []

  while (start < contentTokens.length) {
    let end = start + tokenLimit

    if (end > contentTokens.length) {
      end = contentTokens.length
    }

    const subChunk = contentTokens.slice(start, end).join(' ')
    subChunks.push(subChunk)

    // Calculate the new start index, ensuring it's at least one token past the previous start
    const overlapTokens = Math.floor(overlap * tokenLimit)
    start = Math.min(end, start + overlapTokens + 1)

    // Ensure we're making progress to avoid infinite loops
    if (start <= end) {
      start = end + 1
    }
  }

  return subChunks
}




type Chunk = {
  headerLevel: number
  content: string
}

const chunkMarkdown = async (
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
  }
) => {  const breadcrumbs: string[] = []
  let currentHeaderStack: Chunk[] = []
  let currentContent: string[] = []

  const tokenMax = options.tokenLimit || 512
  const { overlap, removeDecorators } = options || 0.1

  // Pre-process Markdown
  const strippedMarkdownText = stripMarkdown(markdownText, options)

  // Collect chunks
  const lines = strippedMarkdownText.trim().split('\n')
  const chunks: Chunk[] = []

  for (const line of lines) {
    const headerMatch = line.match(/(#+)\s*(.*)/)
    if (headerMatch) {
      if (currentContent.length) {
        const breadcrumb = currentHeaderStack.map(header => header.content).join(' ')
        const content = currentContent.join(' ').trim()
        chunks.push({ headerLevel: 0, content: `${breadcrumb} ${content}` })
        currentContent = []
      }

      const headerLevel = headerMatch[1].length
      const headerText = headerMatch[2].trim()
      while (currentHeaderStack.length && currentHeaderStack[currentHeaderStack.length - 1].headerLevel >= headerLevel) {
        currentHeaderStack.pop()
      }
      currentHeaderStack.push({ headerLevel, content: headerText })
    } else {
      currentContent.push(line.trim())
    }
  }

  // Add any remaining content
  if (currentContent.length) {
    const breadcrumb = currentHeaderStack.map(header => header.content).join(' ')
    const content = currentContent.join(' ').trim()
    chunks.push({ headerLevel: 0, content: `${breadcrumb} ${content}` })
  }

  // Process chunks
  for (const { headerLevel, content } of chunks) {
    const breadcrumbTokens = await getTokenCount(content.split(' ').slice(0, headerLevel).join(' '))
    const contentTokens = await getTokenCount(content)

    if (breadcrumbTokens >= tokenMax) {
      breadcrumbs.push(content)
    } else if (breadcrumbTokens + contentTokens <= tokenMax) {
      breadcrumbs.push(content)
    } else {
      const subChunks = splitLargeChunk(content, breadcrumbTokens, { tokenLimit: tokenMax, overlap })
      for (const subChunk of subChunks) {
        breadcrumbs.push(`${content.split(' ').slice(0, headerLevel).join(' ')} ${subChunk}`)
      }
    }
  }
  // Remove decorators from each chunk if requested
  if (options.removeDecorators) {
    // Using map to create a new array where each chunk is processed by removeMarkdownDecorators
    const result = {
      'chunks' : breadcrumbs.map(chunk => removeMarkdownDecorators(chunk.trim())).filter(chunk => chunk !== '')
    }
    return result
  } else {
    // If removeDecorators is not set, just trim the chunks and remove empty ones
    const result = {
      'chunks' : breadcrumbs.map(chunk => chunk.trim()).filter(chunk => chunk !== '')
    }
    return result
  }
}

export default chunkMarkdown