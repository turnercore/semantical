# Markdown Demo: A Deep Dive into the Ocean

## Introduction

Welcome to this Markdown file that aims to showcase various Markdown features. We'll be using the ocean as an allegory for Markdown, diving deep to explore its components.

### Why the Ocean?

Because just like Markdown, it's simpler on the surface but has great depth.

> "The ocean stirs the heart, inspires the imagination, and brings eternal joy to the soul." - Robert Wyland

## Features

Markdown has many features that make it a versatile tool for formatting text easily and intuitively.

### Headers

As you've seen, headers are used to highlight sections and subsections. They can be nested to various levels.

#### Sub-Sub-Header

Even further down we go.

### Lists

You can create both ordered and unordered lists:

- Fish
- Coral
- Plankton

1. Dive into water
2. Explore
3. Come back up

### Code Blocks

Here's some sample TypeScript code to reverse a string:

```typescript
// Function to reverse a string
const reverseString = (inputString: string): string => {
  return inputString.split('').reverse().join('')
}

// Test the function
const originalString: string = 'ocean'
const reversedString: string = reverseString(originalString)
```
## Links and Images
- [Markdown Cheatsheet](http://commonmark.org/help/)
- ![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/208px-Markdown-mark.svg.png)

## Tables
| Name | Age | Gender |
|------|-----|--------|
| John | 25  | Male   |
| Jane | 30  | Female |


## Blockquotes
> "The sea, once it casts its spell, holds one in its net of wonder forever." - Jacques Yves Cousteau


# Conclusion
This is the conclusion of markdown presentation.


# Edge Cases
## Edge Case 1: ToDo List
- [x] This is a complete item
- [ ] This is an incomplete item
## Edge Case 2: Strikethrough
~~This text is strikethrough.~~

## Edge Case 3: Emoji
:smile: :+1: :sparkles: :camel: :tada:

## Edge Case 4: Footnotes
Here's a footnote [^1] and another [^longnote].

[^1]: Here is the footnote.
[^longnote]: Here's one with multiple blocks.

    Subsequent paragraphs are indented to show that they

## Edge Case 5: Definition List
Markdown
:  Text-to-HTML conversion tool

Authors
:  John
:  Luke

## Edge Case 6: Abbreviations
Markdown converts text to HTML.

*[HTML]: HyperText Markup Language

## Edge Case 7: Automatic URL Linking
<https://www.google.com>

## Edge Case 8: Disabling Automatic URL Linking
`<https://www.google.com>`

## Edge Case 9: Escaping Characters
\*literal asterisks\*

## Edge Case 10: Header Lists
- # Header 1
- # Header 2

## Edge Case 11: Weird Markdown
- # hello
- ## world
	- 42
- # foo


Example Input:
# Hello
## World
This is a hello world
## Earth
This is for Hello Earth
## Mars
### Landing Site A
Needs
- Wheels
- Tires
- People
- Water

Example Output:
```[# Hello ## World This is a hello world, # Hello ## Earth This is for Hello Earth, # Hello ## Mars ### Landing Site A Needs: - Wheels - Tires - People - Water]```


Ok I'd like to go ahead and remove the unneeded markdown structures, specifically things like bold, italics, strikethrough, underline (basically text decorators). These meanings are not going to translate well into a search. How does the function handle something that is too long? Does it just split the entry into multiple entries?

Here's how I'd like it to work when there are too many tokens: Say our token limit (right now just using words for tokens, but when the function checks for tokens it should use a helper function, so we can change how it's checking later) is 512 and we get an array chunk ready to insert and we check the token length and it's 2000 tokens. Sidebar: The function should first ensure the breadcrumbs themselves aren't over the token limit, if so then we just have to remove them and work with only the content (this will likely not happen often or maybe ever, but just to make sure the function is solvable it has to be in there). If the breadcrumbs are fine, then we take the words of the content from the first word to the nth where n = token_max - tokens from bread crumbs, and we make an entry from the breadcrumbs and the split content, then we move on to the next entry. The entries should overlap though to preserve as much context as we can, again this should be adjustable via an options input, but for now we'll say 10% of the tokens should overlap. The next entry should also have the same breadcrumbs appended to it, and the content should be from the nth word to the nth + token_max - tokens from breadcrumbs. This should continue until we have no more content to split. 

For example, pretend the token limit is 10:
# Hello World
This is a hello world fake example. This example is only supposed to be more than the token limit so that we can test the function.

First we take the whole chunk above, and check tokens (it's 22), so that's more than 10, so now we check the breadcrumb tokens (2) and then we get 8 more tokens from the split content.
We're going to overlap 10% (the default which in this case is 1 token) of the tokens in each chunk. 
The result would be: ['Hello World This is a hello world fake example. This', 'Hello World This example is only supposed to be more', 'Hello World more than the token limit so that we', 'Hello World we can test the function.']

Now we have 4 entries, and we can insert them into the database.

Additionally we need to make sure we get that options object in there so we can change things. The options (feel free to include more) and the defaults are as follows:
{
  overlap: 0.1,
  token_limit: 512,
  include_breadcrumbs: true,
  remove_decorators: true,
  remove_links: true,
  remove_images: true,
  remove_code_blocks: false,
  remove_blockquotes: false,
  remove_tables: false,
  remove_lists: false,
  remove_footnotes: false,
  remove_abbreviations: false,
  remove_definitions: false,
  remove_emojis: false
}

We also need to support all the options. This can be a pass on the whole text where we juse regex to match the options and remove what we need to remove. Do all those changes make sense? If so let's get into it.

```python
# Importing required libraries
from collections import Counter
import re
from typing import List, Dict

# Helper function to count tokens (words for now)
def count_tokens(text: str) -> int:
    return len(Counter(text.split()))

# Function to process Markdown text based on the requirements and options
def process_markdown(text: str, options: Dict) -> List[str]:
    # Initialize variables
    breadcrumbs = []
    current_header_stack = []
    current_content = []
    current_token_count = 0
    token_max = options.get('token_limit', 512)
    overlap = options.get('overlap', 0.1)
    
    # Handle Markdown elements based on options
    if options.get('remove_decorators', True):
        markdown_text = re.sub(r"(\*\*|__)(.*?)(\*\*|__)", r"\2", markdown_text)  # Remove bold
        markdown_text = re.sub(r"(\*|_)(.*?)(\*|_)", r"\2", markdown_text)        # Remove italics
        markdown_text = re.sub(r"(~~)(.*?)(~~)", r"\2", markdown_text)             # Remove strikethrough
    
    # Other options can be implemented here ...
    
    # Split lines to process each one
    lines = markdown_text.strip().split("\n")
    for line in lines:
        line_token_count = count_tokens(line)
        current_token_count += line_token_count

        # Check if the line is a header
        header_match = re.match(r"(#+)\s*(.*)", line)
        if header_match:
            header_level = len(header_match.group(1))
            header_text = header_match.group(2).strip()
            
            # If there's content collected, add it to breadcrumbs and clear it
            if current_content:
                breadcrumb_tokens = count_tokens(" ".join([header['text'] for header in current_header_stack]))
                if breadcrumb_tokens > token_max:
                    breadcrumb = " ".join(current_content).strip()
                else:
                    breadcrumb = " ".join([header['text'] for header in current_header_stack]) + " " + " ".join(current_content).strip()
                breadcrumbs.append(breadcrumb)
                
                # Reset content and token count
                current_content = []
                current_token_count = 0
            
            # Pop headers to find where this one belongs
            while current_header_stack and current_header_stack[-1]['level'] >= header_level:
                current_header_stack.pop()
            
            # Add the new header
            current_header_stack.append({'level': header_level, 'text': header_text})
        else:
            # Append the line to current content
            current_content.append(line.strip())
            
        # Check if adding the line exceeds the token limit
        if current_token_count >= token_max:
            breadcrumb_tokens = count_tokens(" ".join([header['text'] for header in current_header_stack]))
            if breadcrumb_tokens > token_max:
                breadcrumb = " ".join(current_content).strip()
            else:
                remaining_tokens = int(token_max * (1 - overlap))
                breadcrumb = " ".join([header['text'] for header in current_header_stack]) + " " + " ".join(current_content[:remaining_tokens]).strip()
            breadcrumbs.append(breadcrumb)
            
            # Remove used tokens, keep the overlap
            current_content = current_content[remaining_tokens:]
            current_token_count = count_tokens(" ".join(current_content))
    
    # Add any remaining content
    if current_content:
        breadcrumb_tokens = count_tokens(" ".join([header['text'] for header in current_header_stack]))
        if breadcrumb_tokens > token_max:
            breadcrumb = " ".join(current_content).strip()
        else:
            breadcrumb = " ".join([header['text'] for header in current_header_stack]) + " " + " ".join(current_content).strip()
        breadcrumbs.append(breadcrumb)

    return breadcrumbs
    ```



```py
# Helper function to count tokens (words for now)
def count_tokens(text: str) -> int:
    return len(text.split())

# Helper function to pre-process Markdown
def strip_markdown(markdown_text:str, options: Dict) -> str :
      # Handle Markdown elements based on options
    if options.get('remove_decorators', True):
        markdown_text = re.sub(r"(\*\*|__)(.*?)(\*\*|__)", r"\2", markdown_text)  # Remove bold
        markdown_text = re.sub(r"(\*|_)(.*?)(\*|_)", r"\2", markdown_text)        # Remove italics
        markdown_text = re.sub(r"(~~)(.*?)(~~)", r"\2", markdown_text) 
    if options.get('remove_decorators', True):
        markdown_text = re.sub(r"(\*\*|__)(.*?)(\*\*|__)", r"\2", markdown_text)  # Remove bold
        markdown_text = re.sub(r"(\*|_)(.*?)(\*|_)", r"\2", markdown_text)        # Remove italics
        markdown_text = re.sub(r"(~~)(.*?)(~~)", r"\2", markdown_text)             # Remove strikethrough
    if options.get('remove_links', True):
        markdown_text = re.sub(r"\[(.*?)\]\(.*?\)", r"\1", markdown_text)          # Remove links
    if options.get('remove_images', True):
        markdown_text = re.sub(r"!\[.*?\]\(.*?\)", "", markdown_text)              # Remove images
    if options.get('remove_code_blocks', False):
        markdown_text = re.sub(r"```.*?```", "", markdown_text, flags=re.DOTALL)    # Remove code blocks
    if options.get('remove_blockquotes', False):
        markdown_text = re.sub(r"^>.*?$", "", markdown_text, flags=re.MULTILINE)    # Remove blockquotes
    if options.get('remove_tables', False):
        markdown_text = re.sub(r"(\|.*\|[\r\n]+)+", "", markdown_text)              # Remove tables
    if options.get('remove_lists', False):
        markdown_text = re.sub(r"(-|\*|\+|\d+\.)\s+.*$", "", markdown_text, flags=re.MULTILINE) # Remove lists
    if options.get('remove_footnotes', False):
        markdown_text = re.sub(r"\[\^.*?\]", "", markdown_text)                     # Remove footnotes
    if options.get('remove_abbreviations', False):
        markdown_text = re.sub(r"\*\[(.*?)\]\:\s*.*$", "", markdown_text, flags=re.MULTILINE) # Remove abbreviations
    if options.get('remove_definitions', False):
        markdown_text = re.sub(r"^(.*?)(\:\s*\n\s*.*?)(\n|$)", "", markdown_text, flags=re.MULTILINE) # Remove definitions
    if options.get('remove_emojis', False):
        markdown_text = re.sub(r":\w+:", "", markdown_text)  
    return markdown_text


# Define options with default values for testing
# options = {
#     'overlap': 0.1,
#     'token_limit': 10,  # For testing
#     'include_breadcrumbs': True,
#     'remove_decorators': True,
#     'remove_links': True,
#     'remove_images': True,
#     'remove_code_blocks': False,
#     'remove_blockquotes': False,
#     'remove_tables': False,
#     'remove_lists': False,
#     'remove_footnotes': False,
#     'remove_abbreviations': False,
#     'remove_definitions': False,
#     'remove_emojis': False
# }

def process_markdown_v4(markdown_text: str, options: Dict) -> List[str]:
    breadcrumbs = []
    current_header_stack = []
    current_content = []

    # Validate options and set to default if out of bounds
    token_max = options.get('token_limit', 512) if options.get('token_limit', 512) > 0 else 512
    overlap = options.get('overlap', 0.1) if 0 <= options.get('overlap', 0.1) <= 1 else 0.1

    # Pre-process Markdown
    markdown_text = strip_markdown(markdown_text, options)
    
    # Collect chunks
    chunks = []
    lines = markdown_text.strip().split("\n")
    for line in lines:
        header_match = re.match(r"(#+)\s*(.*)", line)
        if header_match:
            if current_content:
                breadcrumb = " ".join([header['text'] for header in current_header_stack])
                content = " ".join(current_content).strip()
                chunks.append((breadcrumb, content))
                current_content = []
            
            header_level = len(header_match.group(1))
            header_text = header_match.group(2).strip()
            while current_header_stack and current_header_stack[-1]['level'] >= header_level:
                current_header_stack.pop()
            current_header_stack.append({'level': header_level, 'text': header_text})
        else:
            current_content.append(line.strip())
    
    # Add any remaining content
    if current_content:
        breadcrumb = " ".join([header['text'] for header in current_header_stack])
        content = " ".join(current_content).strip()
        chunks.append((breadcrumb, content))
    
    # Process chunks
    for breadcrumb, content in chunks:
        breadcrumb_tokens = count_tokens(breadcrumb)
        content_tokens = count_tokens(content)
        
        if breadcrumb_tokens >= token_max:
            breadcrumbs.append(content)
        elif breadcrumb_tokens + content_tokens <= token_max:
            breadcrumbs.append(f"{breadcrumb} {content}")
        else:
            # Split large chunk into smaller ones
            sub_chunks = split_large_chunk(content, breadcrumb_tokens, {'token_limit': token_max, 'overlap': overlap})
            for sub_chunk in sub_chunks:
                breadcrumbs.append(f"{breadcrumb} {sub_chunk}")

    return breadcrumbs
```