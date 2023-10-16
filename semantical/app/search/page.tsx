'use client'
import { useState } from 'react'
import { Button, Input, Card, CardHeader, CardContent, CardFooter, toast } from '@/components/ui'
import { EmbeddingSearchResult, type Embedding } from './components/EmbeddingSearchResult'


const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [tagFilter, setTagFilter] = useState([])
  const [knowledgebaseFilter, setKnowledgebaseFilter] = useState('')
  const [searchResults, setSearchResults] = useState<Embedding[]>([])

  const handleSearch = async () => {
    const queryParams = {
      searchTerm,
      filter: {
        tags: tagFilter,
        knowledgebase: knowledgebaseFilter,
      }
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
      const data: Embedding[] = await response.json()
  
      // Handle success and failure
      if (response.ok) {
        //Add the search results to the local state
        setSearchResults(data)  
      } else {
        console.error('Error doing semantic search:', data)
  
        toast({
          title: 'Failed to Search',
          description: 'An error occurred while attempting to delete the API key.',
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
        <h1 className='mb-4'>
          Search
        </h1>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-4">
          <Input
            placeholder="Search term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mr-2"
          />
          <Button onClick={handleSearch}>Search</Button>
        </div>
        <div>
          {searchResults.map((result) => (
            <EmbeddingSearchResult embedding={result} />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {/* Add any footer content here */}
      </CardFooter>
    </Card>
  )
}

export default SearchPage
