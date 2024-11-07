'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import parse from "pptx-parser";

export default function PowerPointParser() {
  const [parsedData, setParsedData] = useState(null)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const result = await parse(file)
        console.log(result)
        setParsedData(result)
      } catch (error) {
        console.error('Error parsing PowerPoint file:', error)
        alert('Error parsing PowerPoint file. Please try again.')
      }
    }
  }

  const DisplayParsedContent = ({ data }) => {
    if (!data) return null

    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Parsed Content:</h2>
        {data.slides.map((slide: any, slideIndex: any) => (
          <Card key={slideIndex} className="mb-4">
            <CardHeader>
              <CardTitle className='flex flex-row justify-between items-center'>Slide {slideIndex + 1}  <Button>
                Generate slide
              </Button></CardTitle>

            </CardHeader>
            <CardContent>
              {slide.pageElements.map((shape: any, shapeIndex: any) => (
                <pre key={shapeIndex} className="bg-gray-100 p-2 rounded-md overflow-x-auto text-xs">
                  {JSON.stringify(shape, null, 2)}
                </pre>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PowerPoint Parser</h1>
      <div className="mb-4">
        <Input
          type="file"
          accept=".pptx"
          onChange={handleFileUpload}
          className="mb-2"
        />
        <p className="text-sm text-gray-600">Upload a .pptx file to parse</p>
      </div>
      <DisplayParsedContent data={parsedData} />
    </div>
  )
}