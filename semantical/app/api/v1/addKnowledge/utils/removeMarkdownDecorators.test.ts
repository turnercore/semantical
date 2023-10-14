import removeMarkdownDecorators from "./removeMarkdownDecorators";

describe("removeMarkdownDecorators", () => {
  it("should strip markdown special characters", () => {
    const markdownText = "# Header\n **Bold** _Italic_";
    const result = removeMarkdownDecorators(markdownText);
    expect(result).toEqual("Header\n Bold Italic");
  });

  it("should remove bold text", () => {
    const markdownText = "This is **bold** text.";
    const result = removeMarkdownDecorators(markdownText);
    expect(result).toEqual("This is bold text.");
  });

  it("should remove italics", () => {
    const markdownText = "This is *italic* text.";
    const result = removeMarkdownDecorators(markdownText);
    expect(result).toEqual("This is italic text.");
  });

  it("should remove strikethrough", () => {
    const markdownText = "This is ~~strikethrough~~ text.";
    const result = removeMarkdownDecorators(markdownText);
    expect(result).toEqual("This is strikethrough text.");
  });

  it("should remove bold and italic", () => {
    const markdownText = "This is ***bold and italic*** text.";
    const result = removeMarkdownDecorators(markdownText);
    expect(result).toEqual("This is bold and italic text.");
  });

  it("should handle headers", () => {
    const markdownText = "# Header1\n## Header2";
    const result = removeMarkdownDecorators(markdownText);
    expect(result).toEqual("Header1\nHeader2");
  });

  it("should handle mixed decorators", () => {
    const markdownText = "# Header **bold** *italic* ~~strikethrough~~ ***bold and italic***";
    const result = removeMarkdownDecorators(markdownText);
    expect(result).toEqual("Header bold italic strikethrough bold and italic");
  });
});
