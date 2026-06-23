import OpenAI from 'openai'
import type { DetectedIngredient } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const INGREDIENT_SYSTEM_PROMPT = `You are an AI food recognition assistant specialized in identifying ingredients from refrigerator photos.

Analyze the image and return a JSON array of detected food items. For each item, provide:
- name: The ingredient name in Korean (e.g., "양파", "달걀", "우유")
- emoji: A representative emoji for the ingredient
- confidence: A number between 0 and 1 indicating detection confidence
- quantity: Estimated quantity (e.g., "3개", "1L", "200g", "약간")
- estimatedShelfLifeDays: Estimated remaining shelf life in days (1-90)
- category: One of: vegetable, fruit, meat, seafood, dairy, condiment, grain, seasoning, other

Rules:
1. ONLY return items you can clearly see in the image
2. Be conservative - don't guess if uncertain
3. For packaged items, try to identify through labels
4. Group similar items together
5. Return ONLY valid JSON array, no other text
6. If no food items detected, return empty array []`

export async function analyzeFridgeImage(
  imageBase64: string
): Promise<DetectedIngredient[]> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: INGREDIENT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: 'text' as const,
              text: 'What ingredients can you see in this refrigerator photo? Return as JSON array.',
            },
            {
              type: 'image_url' as const,
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    const parsed = JSON.parse(content)
    const ingredients = parsed.ingredients || parsed || []

    if (!Array.isArray(ingredients)) {
      throw new Error('Unexpected response format')
    }

    return ingredients.map((item: Record<string, unknown>, index: number) => ({
      id: `detected-${index}-${Date.now()}`,
      name: String(item.name || 'Unknown'),
      emoji: String(item.emoji || '📦'),
      confidence: Number(item.confidence) || 0,
      quantity: String(item.quantity || '약간'),
      estimatedShelfLifeDays: Number(item.estimatedShelfLifeDays) || 7,
      category: (item.category as DetectedIngredient['category']) || 'other',
    }))
  } catch (error) {
    console.error('OpenAI Vision API error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to analyze image'
    )
  }
}

const RECIPE_SYSTEM_PROMPT = `You are an AI chef that creates personalized recipes based on available ingredients.

Given a list of ingredients (some near expiration), create 3-5 recipes that:
1. Maximize use of available ingredients
2. Prioritize ingredients near expiration
3. Are practical for home cooking
4. Include complete instructions

Return a JSON object with a "recipes" array. Each recipe has:
- title: Recipe name in Korean
- description: Brief appetizing description
- cookingTimeMinutes: Total cooking time
- difficulty: "easy", "medium", or "hard"
- cuisineType: Korean, Italian, Japanese, Chinese, Western, etc.
- instructions: Array of step-by-step instructions in Korean
- tips: Array of cooking tips in Korean
- ingredients: Array of { name, emoji, quantity, isOptional } objects
- matchPercentage: How well this matches available ingredients (0-100)
- nearExpiryUsed: Count of near-expiry ingredients used`

export async function generateRecipes(
  ingredients: { name: string; emoji: string; expiresAt?: string }[]
): Promise<{
  recipes: Array<{
    title: string
    description: string
    cookingTimeMinutes: number
    difficulty: 'easy' | 'medium' | 'hard'
    cuisineType: string
    instructions: string[]
    tips: string[]
    ingredients: { name: string; emoji: string; quantity: string; isOptional: boolean }[]
    matchPercentage: number
    nearExpiryUsed: number
  }>
}> {
  try {
    const ingredientList = ingredients
      .map((i) => {
        const expiryInfo = i.expiresAt
          ? ` (유통기한: ${i.expiresAt})`
          : ''
        return `- ${i.emoji} ${i.name}${expiryInfo}`
      })
      .join('\n')

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: RECIPE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `I have these ingredients in my fridge:\n\n${ingredientList}\n\nPlease suggest recipes that use these ingredients, prioritizing items near expiration.`,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    const parsed = JSON.parse(content)
    return { recipes: parsed.recipes || [] }
  } catch (error) {
    console.error('OpenAI Recipe API error:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate recipes'
    )
  }
}
