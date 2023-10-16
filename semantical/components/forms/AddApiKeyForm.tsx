import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger, Form, Card, CardHeader, CardContent, CardFooter, Input, Button, useToast, Alert, AlertTitle, AlertDescription, FormControl, FormItem, FormLabel, FormMessage, ToastAction, AlertDialogFooter, AlertDialogHeader } from '@/components/ui'
import { AlertCircle } from 'lucide-react'

const AddApiKeySchema = z.object({
  name: z.string().optional(),
})

const AddApiKeyForm: React.FC = () => {
  const [receivedApiKey, setReceivedApiKey] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof AddApiKeySchema>>({
    resolver: zodResolver(AddApiKeySchema),
    defaultValues: {
      name: ''
    },
  })

  //Controlling the Alert Dialog
  const [isDialogOpen, setDialogOpen] = useState(false)
  const closeDialog = () => {
    setDialogOpen(false)
  }

  const onSubmit = async (values: z.infer<typeof AddApiKeySchema>) => {
    const payload = { ...values }
    const response = await fetch('/api/v1/apiKeys/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (response.status === 201) {
      setReceivedApiKey(data.apiKey.id)
      setDialogOpen(true)
    } else {
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'There was an error creating your API key.',
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    }
  }

  const copyToClipboard = () => {
    if (receivedApiKey) {
      navigator.clipboard.writeText(receivedApiKey)
    }
  }

  return (
    <>
    <Card>
      <CardHeader title="Add API Key" />
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key Name (Optional)</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="API Key Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter>
              <Button type="submit">
                Create
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>

    <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Your New API Key 🗝️</AlertDialogTitle>
        <AlertDialogDescription>
          {receivedApiKey}
          <br />
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
            Using this API key for API calls is the same as being logged in, please keep it secret as it will have full account access.
            </AlertDescription>
          </Alert>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={closeDialog}>Close</AlertDialogCancel>
        <AlertDialogAction onClick={copyToClipboard}>Copy to Clipboard</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  </>
  )
}

export default AddApiKeyForm
