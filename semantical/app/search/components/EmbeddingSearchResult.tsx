'use client'
import React, { useState } from 'react';
import { Card, Badge, CardHeader, CardContent, CardFooter } from '@/components/ui';

export interface Embedding {
  text: string;
  document: string;
  document_link?: string;
  tags: string[];
  location: string;
  tokens: number;
  length: number;
  breadcrumbs: string[];
  knowledgebase: string;
}

export interface EmbeddingSearchResultProps {
  embedding: Embedding;
}

export const EmbeddingSearchResult: React.FC<EmbeddingSearchResultProps> = ({ embedding }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleDetailsClick = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div className="relative">
      <Card className={`transition-transform duration-300 transform ${showDetails ? 'rotate-y-180' : ''}`}>
        <CardHeader>
          <div className="text-lg font-bold">{embedding.text}</div>
          <div className="text-sm">{embedding.document}</div>
          <div className="flex flex-wrap mt-2">
            {embedding.tags.map((tag) => (
              <Badge key={tag} className="mr-2 mb-2">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {showDetails && (
            <div className="mt-4">
              <div className="text-lg font-bold">Details</div>
              <div className="mt-2">
                <div>
                  <span className="font-bold">Text: </span>
                  {embedding.text}
                </div>
                <div>
                  <span className="font-bold">Location: </span>
                  {embedding.location}
                </div>
                <div>
                  <span className="font-bold">Tokens: </span>
                  {embedding.tokens}
                </div>
                <div>
                  <span className="font-bold">Length: </span>
                  {embedding.length}
                </div>
                <div>
                  <span className="font-bold">Breadcrumbs: </span>
                  {embedding.breadcrumbs.join(', ')}
                </div>
                <div>
                  <span className="font-bold">Tags: </span>
                  {embedding.tags.join(', ')}
                </div>
                <div>
                  <span className="font-bold">Text: </span>
                  {embedding.text}
                </div>
                <div>
                  <span className="font-bold">Knowledgebase: </span>
                  {embedding.knowledgebase}
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <button onClick={handleDetailsClick} className="text-blue-500 hover:underline">
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};