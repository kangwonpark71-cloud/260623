import { NextRequest, NextResponse } from 'next/server'
import { generateRecipes } from '@/lib/openai'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ingredients } = body

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: '재료 목록이 제공되지 않았습니다' },
        { status: 400 }
      )
    }

    const result = await generateRecipes(ingredients)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Recipe API error:', error)

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'OpenAI API 키가 올바르게 설정되지 않았습니다' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: '레시피 생성 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
