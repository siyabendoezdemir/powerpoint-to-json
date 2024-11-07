'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface SlideElement {
  name: string
  size: { width: { value: number; unit: string }; height: { value: number; unit: string } }
  position: { x: { value: number; unit: string }; y: { value: number; unit: string } }
  order: number
  rotate?: number
  fill?: { fillType: string; solidFill?: string }
  shape?: {
    name: string
    shapeType?: string
    text?: {
      bodyProperty: {
        paddingTop: { value: number; unit: string }
        paddingRight: { value: number; unit: string }
        paddingBottom: { value: number; unit: string }
        paddingLeft: { value: number; unit: string }
      }
      paragraphs: Array<{
        textSpans: Array<{
          textRun?: {
            content: string
            style: {
              foregroundColor?: string
              fontFamily?: string
              fontSize?: { value: number; unit: string }
              bold?: boolean
              italic?: boolean
              underline?: { form: string; color: string }
            }
          }
        }>
        paragraphProperty: {
          alignment: string
          spaceBefore?: { value: number; unit: string }
          spaceAfter?: { value: number; unit: string }
        }
      }>
    }
    pathData?: string[]
  }
  outline?: {
    outlineFill?: { fillType: string; solidFill: string }
    weight?: { value: number; unit: string }
  }
  flipH?: boolean
  flipV?: boolean
  image?: {
    name: string
    clipPath: string[]
    contentUrl: string
    cropProperties?: {
      leftOffset: { value: number; unit: string }
      topOffset: { value: number; unit: string }
      rightOffset: { value: number; unit: string }
      bottomOffset: { value: number; unit: string }
    }
  }
}

interface SlideData {
  pageElements: SlideElement[]
  pageProperties: {
    pageBackgroundFill: {
      fillType: string
      solidFill?: string
    }
  }
}

const convertColor = (color: string): string => {
  if (color.startsWith('rgb')) {
    const match = color.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
    if (match) {
      return `#${match.slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`
    }
  }
  return color
}

const convertToPixels = (value: number, unit: string): number => {
  if (unit === 'PX') return value
  // Add more unit conversions if needed
  return value
}

const PowerPointSlide: React.FC<{ slideData: SlideData }> = ({ slideData }) => {
  const sortedElements = [...slideData.pageElements].sort((a, b) => a.order - b.order)

  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden" style={{
      backgroundColor: slideData.pageProperties.pageBackgroundFill.solidFill
        ? convertColor(slideData.pageProperties.pageBackgroundFill.solidFill)
        : 'white'
    }}>
      {sortedElements.map((element, index) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${element.position.x.value / 13.333333}%`,
          top: `${element.position.y.value / 7.5}%`,
          width: `${element.size.width.value / 13.333333}%`,
          height: `${element.size.height.value / 7.5}%`,
          transform: `rotate(${element.rotate || 0}deg)${element.flipH ? ' scaleX(-1)' : ''}${element.flipV ? ' scaleY(-1)' : ''}`,
          backgroundColor: element.fill?.solidFill ? convertColor(element.fill.solidFill) : undefined,
          border: element.outline ? `${element.outline.weight?.value}px solid ${convertColor(element.outline.outlineFill?.solidFill || 'black')}` : undefined,
        }

        if (element.shape?.text) {
          return (
            <div key={index} style={style}>
              {element.shape.text.paragraphs.map((paragraph, pIndex) => (
                <div 
                  key={pIndex}
                  style={{
                    textAlign: paragraph.paragraphProperty.alignment.toLowerCase() as 'left' | 'center' | 'right',
                    padding: `${element.shape?.text?.bodyProperty.paddingTop.value}px ${element.shape?.text?.bodyProperty.paddingRight.value}px ${element.shape?.text?.bodyProperty.paddingBottom.value}px ${element.shape?.text?.bodyProperty.paddingLeft.value}px`,
                    marginTop: paragraph.paragraphProperty.spaceBefore?.value || 0,
                    marginBottom: paragraph.paragraphProperty.spaceAfter?.value || 0,
                    backgroundColor: paragraph.textSpans[0]?.textRun?.content === "Hello, I'm…" ? 'black' : 'transparent',
                  }}
                >
                  {paragraph.textSpans.map((span, sIndex) => {
                    if (!span.textRun) return null
                    const spanStyle: React.CSSProperties = {
                      color: span.textRun.style.foregroundColor ? convertColor(span.textRun.style.foregroundColor) : 'inherit',
                      fontFamily: span.textRun.style.fontFamily || 'inherit',
                      fontSize: span.textRun.style.fontSize ? `${span.textRun.style.fontSize.value}px` : 'inherit',
                      fontWeight: span.textRun.style.bold ? 'bold' : 'normal',
                      fontStyle: span.textRun.style.italic ? 'italic' : 'normal',
                      textDecoration: span.textRun.style.underline && span.textRun.style.underline.form !== 'none' 
                        ? `underline ${convertColor(span.textRun.style.underline.color)}` 
                        : 'none',
                    }
                    return (
                      <span key={sIndex} style={spanStyle}>
                        {span.textRun.content}
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          )
        }

        if (element.shape?.pathData) {
          return (
            <svg key={index} style={style} width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={element.shape.pathData.join(' ')}
                fill={style.backgroundColor || 'none'}
                stroke={element.outline?.outlineFill?.solidFill ? convertColor(element.outline.outlineFill.solidFill) : 'none'}
                strokeWidth={element.outline?.weight?.value || 0}
              />
            </svg>
          )
        }

        if (element.image) {
          return (
            <div key={index} style={style}>
              <img
                src={element.image.contentUrl}
                alt={element.image.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  clipPath: `polygon(${element.image.clipPath.join(', ')})`,
                }}
              />
            </div>
          )
        }

        return <div key={index} style={style} />
      })}
    </div>
  )
}

export default function PowerPointJSONRenderer() {
  const [jsonInput, setJsonInput] = useState('')
  const [slideData, setSlideData] = useState<SlideData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonInput) as SlideData
      if (parsedData && parsedData.pageElements) {
        setSlideData(parsedData)
        setError(null)
      } else {
        throw new Error('Invalid JSON structure. Expected "pageElements" array.')
      }
    } catch (err) {
      setError('Invalid JSON. Please check your input and try again.')
      setSlideData(null)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PowerPoint JSON Renderer</h1>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Paste your JSON here</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your slide JSON here..."
            className="min-h-[200px] mb-4"
          />
          <Button onClick={handleJsonSubmit}>Render Slide</Button>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {slideData && (
        <Card>
          <CardHeader>
            <CardTitle>Rendered Slide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <PowerPointSlide slideData={slideData} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}