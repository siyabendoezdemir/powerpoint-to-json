'use client'

import React, { useState } from 'react'
import { Presentation, Slide, Shape, Text, Image } from 'react-pptx'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Preview from "react-pptx/preview"

interface TextStyle {
    backgroundColor?: string | null
    foregroundColor?: string
    link?: string | null
    bold?: boolean
    italic?: boolean
    fontFamily?: string
    fontSize?: { value: number; unit: string }
    baselineOffset?: string
    strikethrough?: boolean | null
    underline?: boolean
    color?: string | null
    horizontalAlign?: 'left' | 'center' | 'right'
    verticalAlign?: 'top' | 'middle' | 'bottom'
}

interface TextRun {
    content: string
    style: TextStyle
}

interface TextSpan {
    textRun?: TextRun
}

interface Paragraph {
    textSpans: TextSpan[]
}

interface BodyProperty {
    paddingTop?: { value: number; unit: string }
    paddingRight?: { value: number; unit: string }
    paddingBottom?: { value: number; unit: string }
    paddingLeft?: { value: number; unit: string }
}

interface ShapeText {
    bodyProperty: BodyProperty
    paragraphs: Paragraph[]
}

interface SlideElement {
    name: string
    size: { width: { value: number }; height: { value: number } }
    position: { x: { value: number }; y: { value: number } }
    fill?: { fillType: string; solidFill: string }
    shape?: {
        name: string
        shapeType?: string
        text?: ShapeText
    }
    rotate?: number
    outline?: {
        outlineFill?: { solidFill: string }
        weight?: { value: number }
    }
    order: number
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

const convertColor = (rgbString: string): string => {
    const match = rgbString.match(/rgb$$(\d+),\s*(\d+),\s*(\d+)$$/)
    if (match) {
        return `#${match.slice(1).map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`
    }
    return rgbString
}

const convertToInches = (value: number): number => value / 96

const convertFontSize = (fontSize: { value: number; unit: string }): number => {
    // PowerPoint uses points for font sizes, and we need to convert them appropriately
    if (fontSize.unit === 'PX') {
        // Convert pixels to points (1 point = 1.333333 pixels)
        return fontSize.value / 1.333333
    }
    return fontSize.value
}

const PowerPointSlide: React.FC<{ slideData: SlideData }> = ({ slideData }) => {
    const sortedElements = [...slideData.pageElements].sort((a, b) => a.order - b.order)

    const renderSlideElements = () => {
        return sortedElements.map((element, index) => {
            const x = convertToInches(element.position.x.value)
            const y = convertToInches(element.position.y.value)
            const width = convertToInches(element.size.width.value)
            const height = convertToInches(element.size.height.value)

            if (element.shape && element.shape.text) {
                const textContent = element.shape.text.paragraphs.map(para =>
                    para.textSpans
                        .filter(span => span.textRun?.content)
                        .map(span => span.textRun?.content)
                        .join('')
                ).join('\n')

                const textSpan = element.shape.text.paragraphs[0]?.textSpans.find(span => span.textRun?.style)
                const textStyle = textSpan?.textRun?.style || {}

                const fontSize = textStyle.fontSize
                    ? convertFontSize(textStyle.fontSize)
                    : 18 // default size

                return (
                    <Text
                        key={index}
                        style={{
                            x,
                            y,
                            w: width,
                            h: height,
                            color: convertColor(textStyle.foregroundColor || 'rgb(0,0,0)'),
                            fontFace: textStyle.fontFamily || 'Arial',
                            fontSize,
                            bold: textStyle.bold || false,
                            italic: textStyle.italic || false,
                            underline: textStyle.underline ? { style: 'sng' } : undefined,
                            align: textStyle.horizontalAlign || 'left',
                            verticalAlign: textStyle.verticalAlign || 'top',
                            margin: element.shape.text.bodyProperty ? [
                                convertToInches(element.shape.text.bodyProperty.paddingTop?.value || 0),
                                convertToInches(element.shape.text.bodyProperty.paddingRight?.value || 0),
                                convertToInches(element.shape.text.bodyProperty.paddingBottom?.value || 0),
                                convertToInches(element.shape.text.bodyProperty.paddingLeft?.value || 0),
                            ] : undefined,
                        }}
                    >
                        {textContent}
                    </Text>
                )
            } else if (element.shape) {
                return (
                    <Shape
                        key={index}
                        type={element.shape.shapeType as any || 'rect'}
                        style={{
                            x,
                            y,
                            w: width,
                            h: height,
                            backgroundColor: convertColor(element.fill?.solidFill || 'rgb(255,255,255)'),
                        }}
                    />
                )
            }

            return (
                <Shape
                    key={index}
                    type="rect"
                    style={{
                        x,
                        y,
                        w: width,
                        h: height,
                        backgroundColor: 'rgba(200,200,200,0.5)',
                    }}
                />
            )
        })
    }

    return (
        <Slide
            style={{
                backgroundColor: slideData.pageProperties.pageBackgroundFill.fillType === 'SOLID_FILL'
                    ? convertColor(slideData.pageProperties.pageBackgroundFill.solidFill || 'rgb(255,255,255)')
                    : undefined,
            }}
        >
            {renderSlideElements()}
        </Slide>
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
                        <div className="border border-gray-300 rounded-lg overflow-hidden" style={{ width: '100%', aspectRatio: '16/9' }}>
                            <Preview>
                                <Presentation layout="16x9">
                                    <PowerPointSlide slideData={slideData} />
                                </Presentation>
                            </Preview>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}