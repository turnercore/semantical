import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import type { UUID } from '@/types'
import { cookies } from 'next/headers'
import generateEmbeddings from '@/tools/utils/generateEmbeddings'
import containsMarkdownPatterns from '@/tools/utils/containsMarkdownPatterns'
import getTokenCount from '@/tools/utils/getTokenCount'
import chunkMarkdown from '@/tools/utils/chunkMarkdown'
import { Database } from '@/types/supabase'

const saveFileToStorage = async (textContent: string) => {
  return {link: '', error: ''}
}

const getTokenLimitByModel = (model: string) => {
  switch(model) {
    case 'openai/text-embedding-ada-002':
      return 8191
    default:
      return 0
  }
}

type KnowledgeData = {
  fileName: string
  uuid: UUID
  attachedFile?: string
  textContent: string
  tags: string
  saveOriginalFile: boolean
  knowledgebase?: string
  model?: string
}

export async function POST(req: NextRequest) {
  try {
    const requestBody = JSON.parse(await req.text())
    const {
      fileName,
      uuid,
      attachedFile,
      textContent,
      tags,
      saveOriginalFile,
      knowledgebase,
      model,
    }: KnowledgeData = requestBody

    // Return a 200 status code with the fileId
    let message = `File ${fileName} (id: ${uuid}) added`
    if (knowledgebase) {
      message = message + ` to knowledgebase ${knowledgebase}`
    }

    let chunks: string[] = [];
    let chunkMap: number[] = [];
    let chunkTokens: number[] = [];
    let chunkLengths: number[] = [];
    
    // TODO: Add chunkMap, chunkTokens, chunkLengths to the response on each of these
    if (textContent) {
      const filetype: string = containsMarkdownPatterns(textContent) ? 'md' : 'txt';
    
      switch(filetype){
        case 'txt':
          ({chunks } = await processTxt(textContent));
          break;
        case 'md':
          ({chunks } = await chunkMarkdown(textContent));
          break;
        default:
          return NextResponse.json({ message: 'Unsupported File Type', error: 'Unsupported File Type submitted' }, { status: 400 });
      }
    } else if (attachedFile) {
      const filetype: string = (attachedFile.split('.').pop() || '');
    
      switch(filetype){
        case 'txt':
          ({chunks } = await processTxt(attachedFile));
          break;
        case 'md':
          ({chunks } = await chunkMarkdown(attachedFile));
          break;
        default:
          return NextResponse.json({ message: 'Unsupported File Type', error: 'Unsupported File Type submitted' }, { status: 400 });
      }
    } else {
      return NextResponse.json({ message: 'No file or text provided' }, { status: 400 });
    }

    //Process tags
    //Split tags into an array
    const tagArray = tags.split(',')
    //Trim whitespace from each tag
    tagArray.forEach((tag, index) => {
      tagArray[index] = tag.trim()
    })

    //Initialize supabase
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Insert a new row into the 'documents' table
    const { data, error } = await supabase
      .from('documents')
      .insert({
        id: uuid || null,
        name: fileName,
        description: '',
        tags: tagArray,
        knowledgebase: knowledgebase,
        length: textContent.split(' ').length,
        tokens: await getTokenCount(textContent),
      })
      .select()

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    if ( data.length === 0 ) {
      return NextResponse.json({ message: 'No data returned from database' }, { status: 500 })
    }

    // Get document id
    const documentId = data[0].id || uuid

    if (saveOriginalFile) {
      // Upload document to storage bucket if saveOriginalFile is true
      const {link: storageLink, error: storageError} = await saveFileToStorage(attachedFile || textContent)
      // Update document reference with storage bucket URL
      if (storageError) {
        return NextResponse.json({ storageError, message: 'Error saving file to storage bucket' }, { status: 500 })
      }
      const { data, error } = await supabase
        .from('documents')
        .update({ link: storageLink })
        .match({ id: documentId })
    }

    type EmbeddingRow = Database["public"]["Tables"]["embeddings"]["Row"];
    type OptionalIdCreatedAt = Omit<EmbeddingRow, 'id' | 'created_at'> & Partial<Pick<EmbeddingRow, 'id' | 'created_at'>>;
    
    // Take the chunks and turn each one into an embedding record
    const embeddings:  Array<OptionalIdCreatedAt> = await Promise.all(
      chunks.map(async (chunk) => ({
        document_id: documentId || uuid,
        tags: tagArray,
        model: model || null,
        text: chunk,
        user_id: data[0].user_id || ((await supabase.auth.getUser()).data.user?.id as UUID),
        embedding: await generateEmbeddings(chunk, model),
        knowledgebase: knowledgebase || 'default',
        location: chunkMap[chunks.indexOf(chunk)] || 0,
        tokens: chunkTokens[chunks.indexOf(chunk)] || await getTokenCount(chunk),
        length: chunkLengths[chunks.indexOf(chunk)] || 0,
        retrieved_count: 0,
      }))
    );

    // Insert the embeddings into the database
    const { data: embeddingsData, error: embeddingsError } = await supabase
      .from('embeddings')
      .insert(embeddings)
      .select()
    
    if (embeddingsError) {
      return NextResponse.json({ error: embeddingsError, message: 'failed to insert embeddings' }, { status: 500 })
    }

    // Get the embeddings ids and put them into an array
    const embeddingIdArray = embeddingsData.map((embedding) => embedding.id)

    // Update the document reference with the embeddings id in an array
    const { data: documentData, error: documentError } = await supabase
      .from('documents')
      .update({ embeddings: embeddingIdArray })
      .match({ id: documentId })

    if (documentError) {
      return NextResponse.json({ error: documentError, message: 'failed to update document with embeddings id' }, { status: 500 })
    }

    // Return a 200 status code with the document id and embeddings ids
    return NextResponse.json({ message, embeddingIds: embeddingIdArray, documentId }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}

const processTxt = async (textContent: string, model: string = 'openai/text-embedding-ada-002') => {
  const chunks: string[] = []

  // Ensure model is supported
  const tokenLimit = getTokenLimitByModel(model)
  if (tokenLimit === 0) {
    return {chunks}
  }
  //Get token count of textContent
  const totalTokenCount = await getTokenCount(textContent)
  //Break up textContent into chunks if needed
  if (totalTokenCount > tokenLimit) {
    //Split textContent into chunks
    // Take totalTokenCount and divide by tokenLimit * 0.75 to get the number of chunks
    const chunkCount = Math.ceil(totalTokenCount / (tokenLimit * 0.75))
    // Split textContent into chunks of words based on chunkCount
    const words = textContent.split(' ')
    const chunkSize = Math.ceil(words.length / chunkCount)
    // Loop through the words array for each chunk and push the chunk to the result array
    for (let i = 0; i < chunkCount; i++) {
      // Get the chunk from the index, 0 - chunksize, chunksize - chunksize * 2, etc
      const chunk = words.slice(i * chunkSize, (i + 1) * chunkSize)
      // Push the chunk to the result array
      chunks.push(chunk.join(' '))
    }
  }
  //Return array of chunks
  return {chunks}
}



/* To test use this curl statement:
//Right now row level security is on so you need to be logged in. TODO: Add API key access to endpoints
curl -X POST http://localhost:3000/api/v1/addKnowledge \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.txt",
    "uuid": "12345678-1234-5678-abcd-1234567890ab",
    "textContent": "#Hello \n This is a test file \n ## Subheader 1 \n This is a test file",
    "tags": "tag1, tag2",
    "saveOriginalFile": true,
    "knowledgebase": "test",
    "model": "openai/text-embedding-ada-002"
  }'

  # Hello
Hey world I'm testing this now
## Subheading 1
This is a subheading
## Subheading 2
Another **Subheading**

# Final
But really I want to get some things embedded
*/