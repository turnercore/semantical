import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import type { UUID } from '@/types'
import { cookies } from 'next/headers'
import generateEmbeddings from './utils/generateEmbeddings'
import containsMarkdownPatterns from './utils/containsMarkdownPatterns'
import getTokenCount from './utils/getTokenCount'


const getTokenLimitByModel = (model: string) => {
  switch(model) {
    case 'openai/text-embedding-ada-002':
      return 8191
      break
    default:
      return 0
      break
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
    const supabase = createRouteHandlerClient({ cookies })
    // Return a 200 status code with the fileId
    let message = `File ${fileName} (id: ${uuid}) added`
    if (knowledgebase) {
      message = message + ` to knowledgebase ${knowledgebase}`
    }

    //Process textContent or attachedFile
    if (textContent)  {
      //Find out if text is txt or md
      const filetype: string = containsMarkdownPatterns(textContent) ? 'md' : 'txt'

      switch(filetype){
        case 'txt':
          //If txt, process as text
          processTxt(textContent)
          break
        case 'md':
          //If md, process as md
          processMd(textContent)
          break
        default:
          return NextResponse.json({ message: 'Unsupported File Type', error: 'Unsupported File Type submitted' }, { status: 400 })
      }
    } else if (attachedFile) {
      //Figure out what the filetype is
      //Get the file extension
      const filetype: string = attachedFile.split('.').pop() || ''
      //Check if the file extension is supported and process accordingly
      switch(filetype){
        case 'txt':
          //If txt, process as text
          processTxt(attachedFile)
          break
        case 'md':
          //If md, process as md
          processMd(attachedFile)
          break
        default:
          return NextResponse.json({ message: 'Unsupported File Type', error: 'Unsupported File Type submitted' }, { status: 400 })
      }
    } else {
      return NextResponse.json({ message: 'No file or text provided' }, { status: 400 })
    }

    // Generate embeddings
    const {embedding, tokenUseage } = await generateEmbeddings(textContent, model)
    return NextResponse.json({ message, uuid, embedding, tokenUseage }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 })
  }
}


// ---Helper functions for the route handler---

// process tags

// Add to supabase


const processTxt = async (textContent: string, model: string = 'openai/text-embedding-ada-002') => {
  const result: string[] = []

  // Ensure model is supported
  const tokenLimit = getTokenLimitByModel(model)
  if (tokenLimit === 0) {
    return result
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
      result.push(chunk.join(' '))
    }
  }
  //Return array of chunks
  return result
}

const processMd = async (textContent: string, model: string = 'openai/text-embedding-ada-002') => {
  const result: string[] = []

  // Ensure model is supported
  const tokenLimit = getTokenLimitByModel(model)
  if (tokenLimit === 0) {
    return result
  }

  //Break up the markdown based on Markdown elements


  //For each element ensure that it is less than the token limit
  //If it is, add it to the result array
  //If it is not, split it into chunks and add each chunk to the result array

  //Return array of chunks
  return result
}
