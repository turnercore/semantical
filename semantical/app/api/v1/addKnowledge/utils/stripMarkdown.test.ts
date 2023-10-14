import stripMarkdown from "./stripMarkdown";
import type { ProcessMarkdownOptions } from "@/types";  // Adjust the import based on where you defined ProcessMarkdownOptions

// Testing to make sure that the stripMarkdown function works as expected
// The following test cases should be covered: removeDecorators, removeLinks, removeImages, removeCodeBlocks, removeBlockquotes, removeTables, removeLists, removeFootnotes, removeAbbreviations, removeDefinitions, removeEmojis
describe("stripMarkdown", () => {
  it("should remove links when removeLinks is true", () => {
    const markdownText = "This is a [link](http://example.com).";
    const options: ProcessMarkdownOptions = { removeLinks: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("This is a link.");
  });
  
  it("should remove images when removeImages is true", () => {
    const markdownText = "This is an ![image](http://example.com/image.jpg).";
    const options: ProcessMarkdownOptions = { removeImages: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("This is an .");
  });

  it("should remove code blocks when removeCodeBlocks is true", () => {
    const markdownText = "```javascript\nconst x = 10;\n```";
    const options: ProcessMarkdownOptions = { removeCodeBlocks: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("");
  });

  it("should remove blockquotes when removeBlockquotes is true", () => {
    const markdownText = "> This is a blockquote.";
    const options: ProcessMarkdownOptions = { removeBlockquotes: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("");
  });

  it("should remove tables when removeTables is true", () => {
    const markdownText = "| Header 1 | Header 2 |\n|----------|----------|\n| cell 1   | cell 2   |";
    const options: ProcessMarkdownOptions = { removeTables: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("");
  });

  it("should remove lists when removeLists is true", () => {
    const markdownText = "- Item 1\n- Item 2";
    const options: ProcessMarkdownOptions = { removeLists: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("");
  });

  it("should remove footnotes when removeFootnotes is true", () => {
    const markdownText = "This is a footnote[^1].";
    const options: ProcessMarkdownOptions = { removeFootnotes: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("This is a footnote.");
  });

  it("should remove abbreviations when removeAbbreviations is true", () => {
    const markdownText = "The HTML specification\n*[HTML]: Hyper Text Markup Language";
    const options: ProcessMarkdownOptions = { removeAbbreviations: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("The HTML specification");
  });

  it("should remove emojis when removeEmojis is true", () => {
    const markdownText = "This is happy :smile:";
    const options: ProcessMarkdownOptions = { removeEmojis: true };
    const result = stripMarkdown(markdownText, options);
    expect(result).toEqual("This is happy");
  });
});
