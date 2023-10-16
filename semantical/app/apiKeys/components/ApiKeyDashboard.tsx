'use client'
import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTrigger, Button, toast } from '@/components/ui'
import type { Key } from '@/types'


const ApiKeyDashboard = ({ apiKeys }: { apiKeys: Key[] }) => {
  const [keys, setKeys] = useState<Key[]>(apiKeys)
  const [keyVisibility, setKeyVisibility] = useState<Record<string, boolean>>({})
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)

  const openDeleteDialog = (keyId: string) => {
    setIdToDelete(keyId)
  }

  const closeDeleteDialog = () => {
    setIdToDelete(null)
  }

  const toggleKeyVisibility = (keyId: string) => {
    setKeyVisibility((prevVisibility) => ({
      ...prevVisibility,
      [keyId]: !prevVisibility[keyId],
    }))
  }

  const handleDeleteKey = async (keyToDelete: Key) => {
    // Close the delete dialog immediately
    
    // Your API endpoint and request options for deleting the API key
    const apiEndpoint = '/api/v1/apiKeys/delete'
    const requestOptions: RequestInit = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: keyToDelete.id }),
    }

    closeDeleteDialog()
  
    try {
      // Fetch data from the API
      const response = await fetch(apiEndpoint, requestOptions)
      const data = await response.json()
  
      // Handle success and failure
      if (response.ok) {
        // Remove the deleted key from the local state
        setKeys((prevKeys) => prevKeys.filter((key) => key.id !== keyToDelete.id))
  
        toast({
          title: 'API Key Deleted',
          description: 'The API key has been successfully deleted.',
          variant: 'default',
        })
      } else {
        console.error('Error deleting API key:', data)
  
        toast({
          title: 'Failed to Delete API Key',
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>API Key</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {keys.map((key) => (
          <TableRow key={key.id}>
            <TableCell>{key.name}</TableCell>
            <TableCell>
            {keyVisibility[key.id]
              ? key.id
              : key.id
              ? `${key.id.slice(0, 4)}***********${key.id.slice(-4)}`
              : 'error'}
            </TableCell>
            <TableCell>
              <Button onClick={() => toggleKeyVisibility(key.id)}>
                {keyVisibility[key.id] ? 'Hide' : 'Show'}
              </Button>
              <Dialog open={idToDelete === key.id} onOpenChange={() => openDeleteDialog(key.id)}>
                <DialogTrigger>
                  <Button variant="destructive">Delete</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    Delete Key {key.name?.toUpperCase()}?
                  </DialogHeader>
                  <div>Are you sure you want to delete this key?</div>
                  <div>
                    <Button variant="default" onClick={closeDeleteDialog}>Cancel</Button>
                    <Button variant="destructive" onClick={() => handleDeleteKey(key)}>
                      Delete
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default ApiKeyDashboard
