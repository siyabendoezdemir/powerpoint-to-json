'use client'

import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
// @ts-ignore
import parse from "pptx-parser"

export default function PowerPointParser() {
  const [parsedData, setParsedData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      setError(null)
      try {
        const result = await parse(file)
        console.log('Parsed result:', result)
        setParsedData(result)
        setCurrentSlide(0)
      } catch (error) {
        console.error('Error parsing PowerPoint file:', error)
        setError('Error parsing PowerPoint file. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }, [])

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('JSON copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy text: ', err)
      alert('Failed to copy JSON. Please try again.')
    }
  }, [])

  const DisplayParsedContent = useCallback(({ data }: { data: any }) => {
    if (!data || !data.slides || data.slides.length === 0) return null

    const slide = data.slides[currentSlide]

    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Parsed Content:</h2>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className='flex flex-row justify-between items-center'>
              Slide {currentSlide + 1} of {data.slides.length}
              <Button onClick={() => copyToClipboard(JSON.stringify(slide, null, 2))}>
                Copy JSON
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slide.pageElements.map((shape: any, shapeIndex: number) => (
              <pre key={shapeIndex} className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs mb-2">
                {JSON.stringify(shape, null, 2)}
              </pre>
            ))}
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <Button
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            disabled={currentSlide === 0}
          >
            Previous Slide
          </Button>
          <Button
            onClick={() => setCurrentSlide(prev => Math.min(data.slides.length - 1, prev + 1))}
            disabled={currentSlide === data.slides.length - 1}
          >
            Next Slide
          </Button>
        </div>
      </div>
    )
  }, [currentSlide, copyToClipboard])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PowerPoint Parser</h1>
      <div className="mb-4">
        <Input
          type="file"
          accept=".pptx"
          onChange={handleFileUpload}
          className="mb-2"
          disabled={isLoading}
        />
        <p className="text-sm text-gray-600">Upload a .pptx file to parse</p>
      </div>
      {isLoading && <p>Loading... Please wait.</p>}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {parsedData && <DisplayParsedContent data={parsedData} />}
    </div>
  )
}