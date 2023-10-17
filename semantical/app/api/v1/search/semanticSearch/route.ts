import { SupabaseClient, createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cosineSimilarity } from '@/tools/math/cosignSimilarity'
import { euclideanDistance } from '@/tools/math/euclideanDistance'
import { dotProductSimilarity } from '@/tools/math/dotProductSimilarity'
import generateEmbeddings from '@/tools/utils/generateEmbeddings'
import { Database } from '@/types/supabase'
import { cookies } from 'next/headers'
import { flushCache, retrieveFromCache, storeInCache } from './utils/cacheFunctions'

// Constants
const DEFAULT_RESULTS_PER_PAGE = 10
const DEFAULT_PAGE = 1
const DEFAULT_SIMILARITY_TYPE:SimilarityScoreType = 'cosine'

type SimilarityScoreType = 'cosine' | 'euclidean' | 'dotproduct'

export async function POST(req: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });

    // Parse the incoming request body
    const requestBody = JSON.parse(await req.text());
    const { searchTerm, searchType, ignoreCache, page, resultsPerPage: usersResultsPerPage, filter } = requestBody;

    // Validate that a search term is provided
    if (!searchTerm) {
      return NextResponse.json({ error: 'No search term provided' }, { status: 400 });
    }

    // Set up pagination values, determining the range of results to return
    const currentPage = page || DEFAULT_PAGE;
    const resultsPerPage = usersResultsPerPage || DEFAULT_RESULTS_PER_PAGE;
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;

    // Generate a unique cache key based on search parameters
    const cacheKey = `${searchTerm}-${searchType}-${JSON.stringify(filter)}`;

    // Attempt to retrieve results from cache if available and not flagged to ignore
    const cachedResults = await handleCachedResults(cacheKey, ignoreCache, startIndex, endIndex);
    if (cachedResults) {
      return NextResponse.json(cachedResults, { status: 200 });
    }

    // Fetch the current user's session information
    const user = (await supabase.auth.getSession()).data.session?.user;

    // Execute a query to fetch embeddings from the database based on user and filter criteria
    const { embeddingsData, error } = await executeDatabaseQuery(supabase, user, filter);

    // Error handling for various scenarios
    if (!user) {
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }
    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
    if (!embeddingsData || embeddingsData.length === 0) {
      return NextResponse.json({ error: 'No embeddings found' }, { status: 400 });
    }

    // Compute similarity scores and sort results based on scores
    const sortedResults = await getSortedSearchResults(searchTerm, embeddingsData);

    // Cache the sorted results for future use
    storeInCache(cacheKey, sortedResults);

    // Slice the sorted results based on pagination settings
    const topResults = sortedResults.slice(startIndex, endIndex);

    // Return the paginated results and the total number of results
    return NextResponse.json({ topResults, totalResults: sortedResults.length }, { status: 200 });

  } catch (error) {
    // Handle any unexpected errors during processing
    return NextResponse.json({ error }, { status: 500 });
  }
}

// ----- Helper function to calculate similarity or distance based on type -----
const calculateScore = (type: SimilarityScoreType, vectorA: number[], vectorB: number[]): number => {
  // get the similarity score based on the type between the two vectors
  switch (type.toLowerCase()) {
    case 'cosine':
      return cosineSimilarity(vectorA, vectorB)
    case 'euclidean':
      return euclideanDistance(vectorA, vectorB)
    case 'dotproduct':
      return dotProductSimilarity(vectorA, vectorB)
    default:
      return calculateScore(DEFAULT_SIMILARITY_TYPE, vectorA, vectorB)
  }
}

const handleCachedResults = async (cacheKey: string, ignoreCache: boolean, startIndex: number, endIndex: number) => {
  if (!ignoreCache) {
    const cachedResults = await retrieveFromCache(cacheKey)
    if (cachedResults) {
      const topResults = cachedResults.slice(startIndex, endIndex)
      return { topResults, totalResults: cachedResults.length }
    }
  }
  if (ignoreCache) {
    flushCache(cacheKey)
  }
  return null
}

const executeDatabaseQuery = async (supabase: SupabaseClient<Database>, user: any, filter: any) => {
  let query = supabase.from('embeddings').select('*').eq('user_id', user.id)
  if (filter.tags && filter.tags.length > 0) {
    query = query.contains('tags', filter.tags)
  }
  if (filter.knowledgebase) {
    query = query.eq('knowledgebase', filter.knowledgebase)
  }
  const { data: embeddingsData, error } = await query
  return { embeddingsData, error }
}

interface embeddingsData {
  created_at: string;
  document_id: string;
  embedding: number[];
  id: string;
  knowledgebase: string;
  length: number;
  location: number | null;
  model: string | null;
  retrieved_count: number;
  tags: string[] | null;
  text: string;
  tokens: number;
  user_id: string;
}

const getSortedSearchResults = async (searchTerm: string, embeddingsData: embeddingsData[]): Promise<any[]> => {
  // Cache for embeddings
  const searchTermEmbeddings: Record<string, number[]> = {}

  // Map embeddings data to similarity scores
  const similarityScores = await Promise.all(embeddingsData.map(async (embeddingRow: embeddingsData) => {
    // Check for valid embedding data
    if (!embeddingRow.embedding || embeddingRow.embedding.length === 0 || embeddingRow.model === null || embeddingRow.model === '') {
      return {
        id: embeddingRow.id,
        score: 0,
      }
    }
    // Check if we already have a cached embedding for the current model
    if (!searchTermEmbeddings[embeddingRow.model]) {
      console.log(`Generating embedding for search term using model: ${embeddingRow.model}`)
      searchTermEmbeddings[embeddingRow.model] = await generateEmbeddings(searchTerm, embeddingRow.model)
    }

    // Use the cached embedding to calculate the similarity score
    return {
      id: embeddingRow.id,
      score: calculateScore(
        'cosine', // Assuming cosine as default you can modify this as needed
        searchTermEmbeddings[embeddingRow.model],
        embeddingRow.embedding
      ),
    }
  }))

  // Sort the results based on scores
  return similarityScores.sort((a, b) => b.score - a.score)
}
