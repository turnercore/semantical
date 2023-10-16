
// Get embeddings from AI, currently using openai but will provide options for other models
import OpenAI from 'openai'

const openai_api_key = process.env.OPENAI_API_KEY || ''

const openai = new OpenAI({
  apiKey: openai_api_key, // defaults to process.env["OPENAI_API_KEY"]
})

const generateEmbeddings = async (text: string, model: string = 'openai/text-embedding-ada-002')=> {
  // split model into header and body
  const modelHeader = model.split('/')[0]
  const modelBody = model.split('/')[1]
  // Find out if the first part of the / route is openai 
  if (modelHeader === 'openai') {
    try {
      const result = await openai.embeddings.create({
        "model": modelBody,
        "input": text
      })
      // const tokenUseage = result.usage.total_tokens
      const embedding = result.data[0].embedding
      return embedding
    }
    catch (error) {
      console.error(error)
    }
  }
  //Handle other model cases here...

  //If no model is found, return an empty array
  return []
}

export default generateEmbeddings