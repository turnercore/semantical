'use client'
import { useState } from 'react'
import { Button, Input, Card, CardHeader, CardContent, CardFooter, toast } from '@/components/ui'
import { EmbeddingSearchResult, type Embedding } from './components/EmbeddingSearchResult'

interface SearchResults {
  topResults: Embedding[]
  totalResults: number
}

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [knowledgebaseFilter, setKnowledgebaseFilter] = useState<string>('')
  const [searchResults, setSearchResults] = useState<SearchResults>({ topResults: [], totalResults: 0 })
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [resultsPerPage, setResultsPerPage] = useState<number>(10)

  const handleSearch = async () => {
    const queryParams = {
      searchTerm,
      page: currentPage,
      resultsPerPage: resultsPerPage,
      filter: {
        tags: tagFilter,
        knowledgebase: knowledgebaseFilter,
      },
    }
    const apiEndpoint = '/api/v1/search/semanticSearch'
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryParams),
    }
  
    try {
      // Fetch data from the API
      const response = await fetch(apiEndpoint, requestOptions)
      const data = await response.json()
  
      // Handle success and failure
      if (response.ok) {
        // Add the search results to the local state
        setSearchResults(data)
      } else {
        console.error('Error doing semantic search:', data)
  
        toast({
          title: 'Failed to Search',
          description: 'An error occurred while attempting to perform the search.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error)
  
      toast({
        title: 'Unexpected Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    }
  }
  

  return (
    <Card className="p-4">
      <CardHeader>
        <h1 className="mb-4">Search</h1>
      </CardHeader>
      <CardContent>
        {/* Search bar and button */}
        <div className="flex items-center mb-4">
          <Input
            placeholder="Search term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>

        {/* Pagination controls */}
        <div className="flex justify-between mb-4">
          <select onChange={(e) => setResultsPerPage(Number(e.target.value))} value={resultsPerPage}>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
          <div>
            <Button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </Button>
            <Button onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
          </div>
        </div>
        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.topResults.length > 0 ? (
            searchResults.topResults.map((embedding, index) => (
              <EmbeddingSearchResult key={`embedding${index}`} embedding={embedding} />
            ))
          ) : (
            <p>No results found</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {/* Footer content for displaying pagination status */}
        <div className="flex justify-between items-center">
          <span>
            Displaying results {((currentPage - 1) * resultsPerPage) + 1}-
            {Math.min(currentPage * resultsPerPage, searchResults.totalResults)} / {searchResults.totalResults}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}

export default SearchPage
