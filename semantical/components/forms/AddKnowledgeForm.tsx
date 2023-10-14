"use client"
import { z } from 'zod'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
  Checkbox,
  Switch,
  Label,
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardHeader,
  Button,
  useToast,
  ToastAction
} from '@/components/ui'

const ALLOWED_FILE_TYPES = ['.txt', '.md']

const AddKnowledgeFormSchema = z.object({
  textContent: z.string().optional(),
  fileName: z.string().min(1, 'Required').max(100, 'Must be less than 100 characters'),
  uuid: z.string().min(1, 'Required').max(100, 'Must be less than 100 characters'),
  tags: z.string().optional(),
  saveOriginalFile: z.boolean(),
  knowledgebase: z.string().max(100, 'Must be less than 100 characters').optional()
})

function getRandomUUID() {
  return crypto.randomUUID()
}

const AddKnowledgeForm = () => {
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [hasFormBeenSubmitted, setHasFormBeenSubmitted] = useState<boolean>(false)

  const { toast } = useToast()

  // Define the form
  const form = useForm<z.infer<typeof AddKnowledgeFormSchema>>({
    resolver: zodResolver(AddKnowledgeFormSchema),
    defaultValues: {
      fileName: '',
      knowledgebase: '',
      textContent: '',
      uuid: getRandomUUID(),
      tags: '',
      saveOriginalFile: false
    },
  })

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof AddKnowledgeFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.

    //Show the footer
    setHasFormBeenSubmitted(true)

    //Set loading
    //setIsLoading(true)

    //Submit data to api endpoint at /api/v1/addKnowledge
    const payload = { ...values }
    const response = await fetch('/api/v1/addKnowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json() 

    const serverMessage = data.message ? data.message : ''
    const serverError = data.error ? data.error : ''

    if (response.status === 200) {
      // Success
      toast({
        title: 'Knowledge Added',
        description: 'Your knowledge has been added to your knowledgebase. You can now search for it. ' + serverMessage,
      })
  } else {
      // Error
      toast({
        variant: 'destructive',
        title: 'Oh no! Something went wrong.',
        description: 'There was an error adding your knowledge. ' + serverError,
        action: <ToastAction altText="Try again"> Try again </ToastAction>,
      })
    }

    //Reset the form
    setAttachedFile(null)
    form.reset()
    form.setValue('uuid', getRandomUUID())
  }

  return (
    <Card className='max-w-[700px] mx-auto space-y-1'>
      <CardHeader>
        <CardTitle>Add Knowledge</CardTitle>
        <CardDescription>Add some knowledge to your knoweledgebase. Supported file types: {ALLOWED_FILE_TYPES.join(', ')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-5'>
          <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>

            {/* File Name */}
            <FormField
              control={form.control}
              name="fileName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="File Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Text Content */}
            <FormField
              control={form.control}
              name="textContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write plaintext or markdown, or attach a file directly." disabled={!!attachedFile} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachment */}
            <FormItem>
              <FormLabel>Attach File</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept={ALLOWED_FILE_TYPES.join(',')}
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                />
              </FormControl>
            </FormItem>

            {/* UUID */}
            <FormField
              control={form.control}
              name="uuid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UUID</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="uuid" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="Tags (separated by commas)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Save Original File Checkbox */}
            <FormField
                    control={form.control}
                    name="saveOriginalFile"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 max-w-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Save Original File
                          </FormLabel>
                          <FormDescription>
                          Save the full original file to the database (this will take up storage space).
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                
                <FormField
                    control={form.control}
                    name="knowledgebase"
                    render={({ field }) => (
                      <FormItem className="flex flex-col items-center justify-between rounded-lg border p-4 max-w-lg">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Knowledgebase
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Input type="text" placeholder="Optional" {...field} />
                        </FormControl>
                        <FormDescription>
                          Save to a specific knowledgebase for reference.
                          </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

            <div className="flex items-center space-x-5 p-4">
              <Button type="submit" className='mx-auto' >Submit</Button>
            </div>
          </form>
          </Form>
        </CardContent>
        {hasFormBeenSubmitted && (
          <CardFooter>
            <div className="flex items-center justify-center">
              <p className="text-sm text-gray-500">Sent with ❤️</p>
            </div>
          </CardFooter>
        )}
    </Card>
  )
}


export default AddKnowledgeForm