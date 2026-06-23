'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChefHat,
  Clock,
  Utensils,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Star,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { Recipe } from '@/types'
import { getDifficultyColor, getDifficultyLabel } from '@/lib/utils'

const FALLBACK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: '김치찌개',
    description: '묵은 김치와 두부로 만드는 얼큰한 김치찌개',
    cookingTimeMinutes: 25,
    difficulty: 'easy',
    cuisineType: '한식',
    imageUrl: '',
    instructions: [
      '냄비에 참기름을 두르고 김치를 볶아주세요',
      '물을 붓고 끓여주세요',
      '두부와 파를 넣고 한소끔 더 끓여주세요',
    ],
    tips: ['김치가 익을수록 더 깊은 맛이 나요', '두부는 마지막에 넣어야 부서지지 않아요'],
    ingredients: [
      { ingredientId: '1', name: '김치', emoji: '🥬', quantity: '2컵', isOptional: false, isInFridge: true },
      { ingredientId: '2', name: '두부', emoji: '🧊', quantity: '1모', isOptional: false, isInFridge: true },
      { ingredientId: '3', name: '파', emoji: '🫚', quantity: '약간', isOptional: false, isInFridge: true },
    ],
    matchPercentage: 85,
    nearExpiryUsed: 1,
  },
  {
    id: '2',
    title: '계란볶음밥',
    description: '냉장고 파먹기 최고의 요리',
    cookingTimeMinutes: 15,
    difficulty: 'easy',
    cuisineType: '한식',
    imageUrl: '',
    instructions: [
      '달걀을 풀어 팬에 스크램블해주세요',
      '밥을 넣고 골고루 섞어주세요',
      '간장이나 소금으로 간을 해주세요',
    ],
    tips: ['대파를 넣으면 더 고소해요', '참기름 한 방울이 비결이에요'],
    ingredients: [
      { ingredientId: '4', name: '달걀', emoji: '🥚', quantity: '2개', isOptional: false, isInFridge: true },
      { ingredientId: '5', name: '밥', emoji: '🍚', quantity: '1공기', isOptional: false, isInFridge: true },
    ],
    matchPercentage: 72,
    nearExpiryUsed: 0,
  },
  {
    id: '3',
    title: '야채스프',
    description: '남은 채소를 모두 넣어 만드는 건강 스프',
    cookingTimeMinutes: 30,
    difficulty: 'medium',
    cuisineType: '양식',
    imageUrl: '',
    instructions: [
      '채소를 깍둑썰기 해주세요',
      '냄비에 올리브유를 두르고 채소를 볶아주세요',
      '육수 또는 물을 붓고 끓여주세요',
      '블렌더로 곱게 갈아주세요',
    ],
    tips: ['생크림을 넣으면 더 고소해요', '냉동해도 맛이 변하지 않아요'],
    ingredients: [
      { ingredientId: '6', name: '양파', emoji: '🧅', quantity: '1개', isOptional: false, isInFridge: true },
      { ingredientId: '7', name: '당근', emoji: '🥕', quantity: '1개', isOptional: false, isInFridge: true },
    ],
    matchPercentage: 60,
    nearExpiryUsed: 2,
  },
]

export default function RecipesPage() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<{ name: string; emoji: string; expiresAt?: string }[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('fridgeIngredients')
    if (stored) {
      setIngredients(JSON.parse(stored))
    }
    // Load with fallback recipes
    setRecipes(FALLBACK_RECIPES)
    setIsLoading(false)
  }, [])

  const handleGenerateWithAI = async () => {
    if (ingredients.length === 0) {
      toast.error('먼저 재료를 추가해주세요')
      router.push('/upload')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })

      if (!res.ok) throw new Error('레시피 생성에 실패했습니다')

      const data = await res.json()
      if (data.recipes?.length > 0) {
        setRecipes(data.recipes)
        toast.success(`${data.recipes.length}개의 레시피를 찾았어요!`)
      }
    } catch {
      toast.error('AI 레시피 생성에 실패했어요. 기본 레시피를 보여드립니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 pt-8">
        <Skeleton className="h-12 w-48 mx-auto" />
        <Skeleton className="h-64 w-full max-w-md mx-auto" />
        <Skeleton className="h-64 w-full max-w-md mx-auto" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 gap-1.5">
          <ChefHat className="h-3.5 w-3.5" />
          레시피 추천
        </Badge>
        <h1 className="text-3xl font-bold mb-2">
          {ingredients.length > 0
            ? `${ingredients.length}개의 재료로 만들 수 있는 요리`
            : '레시피를 찾아보세요'}
        </h1>
        <p className="text-muted-foreground">
          {ingredients.length > 0
            ? 'AI가 가진 재료를 분석해 최적의 레시피를 추천해드려요'
            : '먼저 냉장고 사진을 업로드해주세요'}
        </p>
      </div>

      {ingredients.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            AI로 레시피 다시 생성
          </Button>
        </div>
      )}

      {/* My Ingredients */}
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {ingredients.map((item, i) => (
            <Badge key={i} variant="secondary" className="gap-1.5 px-3 py-1.5">
              <span>{item.emoji}</span>
              <span>{item.name}</span>
            </Badge>
          ))}
        </div>
      )}

      {/* Recipe Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card
            key={recipe.id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{recipe.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.cookingTimeMinutes}분
                </Badge>
                <Badge
                  variant="outline"
                  className={`gap-1 ${getDifficultyColor(recipe.difficulty)}`}
                >
                  <Utensils className="h-3 w-3" />
                  {getDifficultyLabel(recipe.difficulty)}
                </Badge>
                <Badge variant="secondary">{recipe.cuisineType}</Badge>
              </div>

              {/* Match Percentage */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${recipe.matchPercentage}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">
                  {recipe.matchPercentage}%
                </span>
              </div>

              {/* Used Ingredients */}
              <div className="flex flex-wrap gap-1.5">
                {recipe.ingredients.slice(0, 4).map((ing, i) => (
                  <Badge
                    key={i}
                    variant={ing.isInFridge ? 'default' : 'outline'}
                    className={`text-xs gap-1 ${!ing.isInFridge ? 'opacity-50' : ''}`}
                  >
                    {ing.emoji}
                    {ing.name}
                  </Badge>
                ))}
                {recipe.ingredients.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{recipe.ingredients.length - 4}
                  </Badge>
                )}
              </div>

              {recipe.nearExpiryUsed > 0 && (
                <div className="mt-3 flex items-center gap-1 text-xs text-amber-500">
                  <AlertTriangle className="h-3 w-3" />
                  유통기한 임박 재료 {recipe.nearExpiryUsed}개 사용
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedRecipe(null)}
        >
          <Card
            className="w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-1">
                    {selectedRecipe.title}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {selectedRecipe.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedRecipe(null)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedRecipe.cookingTimeMinutes}분
                </Badge>
                <Badge
                  variant="outline"
                  className={`gap-1 ${getDifficultyColor(selectedRecipe.difficulty)}`}
                >
                  <Utensils className="h-3 w-3" />
                  {getDifficultyLabel(selectedRecipe.difficulty)}
                </Badge>
                <Badge variant="secondary">
                  {selectedRecipe.cuisineType}
                </Badge>
                <Badge variant="success" className="gap-1">
                  <Star className="h-3 w-3" />
                  {selectedRecipe.matchPercentage}% 매칭
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ingredients */}
              <div>
                <h3 className="font-semibold mb-2">필요한 재료</h3>
                <div className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="text-lg">{ing.emoji}</span>
                      <span className="flex-1">{ing.name}</span>
                      <span className="text-muted-foreground">
                        {ing.quantity}
                      </span>
                      {!ing.isInFridge && (
                        <Badge variant="outline" className="text-xs">
                          필요
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Instructions */}
              <div>
                <h3 className="font-semibold mb-2">조리 방법</h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {selectedRecipe.tips.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">💡 요리 팁</h3>
                    <ul className="space-y-1">
                      {selectedRecipe.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
