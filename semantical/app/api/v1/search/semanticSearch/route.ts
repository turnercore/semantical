import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cosineSimilarity } from '@/tools/math/cosignSimilarity'
import { euclideanDistance } from '@/tools/math/euclideanDistance'
import { dotProductSimilarity } from '@/tools/math/dotProductSimilarity'
import generateEmbeddings from '@/tools/utils/generateEmbeddings'
import { Database } from '@/types/supabase'
import { cookies } from 'next/headers'
import { flushCache, retrieveFromCache, storeInCache } from './utils/cacheFunctions'

// Constants
const DEFAULT_MODEL = 'openai/text-embedding-ada-002'
const DEFAULT_RESULTS_PER_PAGE = 10
const DEFAULT_PAGE = 1

// Helper function to calculate similarity or distance based on type
const calculateScore = (type: string, vectorA: number[], vectorB: number[]) => {
  switch (type.toLowerCase()) {
    case 'cosine':
      return cosineSimilarity(vectorA, vectorB)
    case 'euclidean':
      return euclideanDistance(vectorA, vectorB)
    case 'dotproduct':
      return dotProductSimilarity(vectorA, vectorB)
    default:
      return cosineSimilarity(vectorA, vectorB) // Default to cosine similarity
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('Starting POST request processing')

    // Initialize Supabase
    console.log('Initializing Supabase')
    const supabase = createRouteHandlerClient<Database>({ cookies })

    // Parse request body
    console.log('Parsing request body')
    const { searchTerm, searchType, ignoreCache, page, resultsPerPage: usersResultsPerPage, filter } = JSON.parse(await req.text())

    // Validate search term
    if (!searchTerm) {
      console.log('Error: No search term provided')
      return NextResponse.json({ error: 'No search term provided' }, { status: 400 })
    }

    // Pagination setup
    console.log('Setting up pagination')
    const currentPage = page || DEFAULT_PAGE
    const resultsPerPage = usersResultsPerPage || DEFAULT_RESULTS_PER_PAGE
    const startIndex = (currentPage - 1) * resultsPerPage
    const endIndex = startIndex + resultsPerPage

    // Cache key generation
    console.log('Generating cache key')
    const cacheKey = `${searchTerm}-${searchType}-${JSON.stringify(filter)}`

    // Check for cached results
    console.log('Checking for cached results')
    if (!ignoreCache) {
      const cachedResults = await retrieveFromCache(cacheKey)
      if (cachedResults) {
        console.log('Returning cached results')
        const topResults = cachedResults.slice(startIndex, endIndex)
        return NextResponse.json({ topResults }, { status: 200 })
      }
    }

    // Flush existing cache if ignoreCache flag is set
    if (ignoreCache) {
      console.log('Flushing existing cache')
      flushCache(cacheKey)
    }

    // Model setup
    console.log('Setting up model')
    const model = filter.model ? filter.model : DEFAULT_MODEL

    // Fetch user from session
    console.log('Fetching user from session')
    const user = (await supabase.auth.getSession()).data.session?.user
    if (!user) {
      console.log('Error: No user found')
      return NextResponse.json({ error: 'No user found' }, { status: 400 })
    }

    // Generate embedding for search term
    console.log('Generating embedding for search term')
    const searchEmbedding = await generateEmbeddings(searchTerm, model)

    // Initialize query to fetch embeddings from database
    console.log('Initializing query to fetch embeddings')
    let query = supabase
      .from('embeddings')
      .select('*')
      .eq('user_id', user.id)
      .eq('model', model)

    // Apply additional filters
    if (filter.tags && filter.tags.length > 0) {
      query = query.contains('tags', filter.tags)
    }
    if (filter.knowledgebase) {
      query = query.eq('knowledgebase', filter.knowledgebase)
    }

    // Execute query
    console.log('Executing query')
    const { data: embeddingsData, error } = await query
    if (error) {
      console.log(`Error: ${error}`)
      return NextResponse.json({ error }, { status: 500 })
    }

    // Calculate similarity scores
    console.log('Calculating similarity scores')
    const similarityScores = embeddingsData.map((embeddingRow) => ({
      id: embeddingRow.id,
      score: calculateScore(searchType || 'cosine', searchEmbedding, embeddingRow.embedding),
    }))

    // Sort results and store in cache
    console.log('Sorting results and storing in cache')
    const sortedResults = similarityScores.sort((a, b) => b.score - a.score)
    storeInCache(cacheKey, sortedResults)

    // Take top results based on pagination
    console.log('Slicing results based on pagination')
    const topResults = sortedResults.slice(startIndex, endIndex)

    // Return results
    console.log('Returning results')
    return NextResponse.json({ topResults }, { status: 200 })

  } catch (error) {
    console.log(`Caught an error: ${error}`)
    return NextResponse.json({ error }, { status: 500 })
  }
}
