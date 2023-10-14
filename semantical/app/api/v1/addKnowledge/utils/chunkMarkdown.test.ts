import chunkMarkdown from "./chunkMarkdown";
import type { ProcessMarkdownOptions } from "@/types";  // Adjust the import based on where you defined ProcessMarkdownOptions

describe("chunkMarkdown", () => {

  it("should handle simple markdown text", async () => {
    const markdownText = `
      # Header 1
      Content under header 1.
      ## Subheader 1
      Content under subheader 1.
    `;

    const options: ProcessMarkdownOptions = {
      tokenLimit: 10,
      overlap: 0.1,
      // add other options as necessary
    };

    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual([
      "Header 1 Content under header 1.",
      "Header 1 Subheader 1 Content under subheader 1."
    ]);
  });

  it("should handle empty markdown text", async () => {
    const markdownText = "";
    const options: ProcessMarkdownOptions = { tokenLimit: 10, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual([]);
  });

  it("should handle markdown text with only headers", async () => {
    const markdownText = "# Header 1\n## Subheader 1";
    const options: ProcessMarkdownOptions = { tokenLimit: 10, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual([]);
  });

  it("should handle markdown text with no headers", async () => {
    const markdownText = "Just some content.";
    const options: ProcessMarkdownOptions = { tokenLimit: 10, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual(["Just some content."]);
  });

  it("should split content when token limit is reached", async () => {
    const markdownText = "# Header\nThis content has many tokens and should be split.";
    const options: ProcessMarkdownOptions = { tokenLimit: 4, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual([
      "Header This content has",
      "Header many tokens and",
      "Header should be split."
    ]);
  });

  it("should handle multiple headers with the same levels", async () => {
    const markdownText = "# Header 1\nContent 1\n# Header 2\nContent 2";
    const options: ProcessMarkdownOptions = { tokenLimit: 10, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual(["Header 1 Content 1", "Header 2 Content 2"]);
  });

  it("should handle deeply nested headers", async () => {
    const markdownText = "# H1\n## H2\n### H3\nContent";
    const options: ProcessMarkdownOptions = { tokenLimit: 15, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual(["H1 H2 H3 Content"]);
  });

  it("should handle non-ASCII characters", async () => {
    const markdownText = "# Überschrift\nInhalt";
    const options: ProcessMarkdownOptions = { tokenLimit: 10, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual(["Überschrift Inhalt"]);
  });

  it("should strip markdown special characters", async () => {
    const markdownText = "# Header \n **Bold** _Italic_";
    const options: ProcessMarkdownOptions = { tokenLimit: 10, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual(["Header Bold Italic"]);
  });

  it("should handle mixed cases", async () => {
    const markdownText = "# H1\nContent 1\n## H2\n_Content 2_";
    const options: ProcessMarkdownOptions = { tokenLimit: 10, overlap: 0.1 };
    const result = await chunkMarkdown(markdownText, options);
    expect(result).toEqual([
      "H1 Content 1",
      "H1 H2 Content 2"
    ]);
  });
  
});
