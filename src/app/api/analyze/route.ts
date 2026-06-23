import { NextRequest, NextResponse } from 'next/server'
import { analyzeFridgeImage } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image } = body

    if (!image) {
      return NextResponse.json(
        { error: '이미지가 제공되지 않았습니다' },
        { status: 400 }
      )
    }

    const ingredients = await analyzeFridgeImage(image)

    return NextResponse.json({ ingredients })
  } catch (error) {
    console.error('Analyze API error:', error)

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API 키가 올바르게 설정되지 않았습니다' },
          { status: 500 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: '이미지 분석 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
