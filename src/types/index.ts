// ─── Ingredient ───
export interface Ingredient {
  id: string
  name: string
  emoji: string
  category: IngredientCategory
  shelfLifeDays: number
}

export type IngredientCategory =
  | 'vegetable'
  | 'fruit'
  | 'meat'
  | 'seafood'
  | 'dairy'
  | 'condiment'
  | 'grain'
  | 'seasoning'
  | 'other'

// ─── User's Fridge Item ───
export interface FridgeItem {
  id: string
  userId: string
  ingredientId: string
  ingredient: Ingredient
  quantity: number
  unit: string
  addedAt: string
  expiresAt: string
  isExpiringSoon: boolean
}

// ─── Recipe ───
export interface Recipe {
  id: string
  title: string
  description: string
  cookingTimeMinutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  cuisineType: string
  imageUrl: string
  instructions: string[]
  tips: string[]
  ingredients: RecipeIngredient[]
  matchPercentage: number
  nearExpiryUsed: number
}

export interface RecipeIngredient {
  ingredientId: string
  name: string
  emoji: string
  quantity: string
  isOptional: boolean
  isInFridge: boolean
}

// ─── Scan Result ───
export interface ScanResult {
  id: string
  imageUrl: string
  detectedIngredients: DetectedIngredient[]
  createdAt: string
  status: 'processing' | 'completed' | 'failed'
}

export interface DetectedIngredient {
  id: string
  name: string
  emoji: string
  confidence: number
  quantity: string
  estimatedShelfLifeDays: number
  category: IngredientCategory
}

// ─── API ───
export interface AnalyzeImageRequest {
  image: string
}

export interface AnalyzeImageResponse {
  ingredients: DetectedIngredient[]
  error?: string
}

export interface RecipeRecommendationRequest {
  ingredientIds: string[]
  preferences?: {
    cuisineType?: string
    maxCookingTime?: number
    difficulty?: string
  }
}

export interface RecipeRecommendationResponse {
  recipes: Recipe[]
  error?: string
}

// ─── User Profile ───
export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
  preferences: UserPreferences
}

export interface UserPreferences {
  cuisineTypes: string[]
  difficulty: string[]
  maxCookingTime: number
  servingSize: number
  dietaryRestrictions: string[]
}
