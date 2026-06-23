'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, ChefHat, Plus, X, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import type { DetectedIngredient, AnalyzeImageResponse } from '@/types'

export default function ScanResultPage() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<DetectedIngredient[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('scanResult')
    if (!stored) {
      router.push('/upload')
      return
    }
    const data: AnalyzeImageResponse = JSON.parse(stored)
    setIngredients(data.ingredients || [])
  }, [router])

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id))
  }

  const addIngredient = () => {
    const name = newIngredient.trim()
    if (!name) return

    if (ingredients.some((i) => i.name === name)) {
      toast.error('이미 추가된 재료입니다')
      return
    }

    setIngredients((prev) => [
      ...prev,
      {
        id: `manual-${Date.now()}`,
        name,
        emoji: '📦',
        confidence: 1,
        quantity: '약간',
        estimatedShelfLifeDays: 7,
        category: 'other',
      },
    ])
    setNewIngredient('')
    toast.success(`${name} 추가됨`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addIngredient()
  }

  const handleGenerateRecipes = () => {
    if (ingredients.length === 0) {
      toast.error('최소 1개 이상의 재료가 필요합니다')
      return
    }

    sessionStorage.setItem(
      'fridgeIngredients',
      JSON.stringify(
        ingredients.map((i) => ({
          name: i.name,
          emoji: i.emoji,
          expiresAt: new Date(
            Date.now() + i.estimatedShelfLifeDays * 86400000
          ).toISOString().split('T')[0],
        }))
      )
    )
    router.push('/recipes')
  }

  const avgConfidence =
    ingredients.length > 0
      ? Math.round(
          ingredients.reduce((a, i) => a + i.confidence, 0) /
            ingredients.length *
            100
        )
      : 0

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          AI 분석 완료
        </Badge>
        <h1 className="text-3xl font-bold mb-2">
          {ingredients.length}개의 재료를 찾았어요
        </h1>
        <p className="text-muted-foreground">
          인식이 안 된 재료는 직접 추가하거나 수정해주세요
        </p>
      </div>

      {/* Analysis Stats */}
      <Card>
        <CardContent className="p-4 flex gap-6 justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {ingredients.length}
            </div>
            <div className="text-xs text-muted-foreground">감지된 재료</div>
          </div>
          <Separator orientation="vertical" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {avgConfidence}%
            </div>
            <div className="text-xs text-muted-foreground">평균 신뢰도</div>
          </div>
          <Separator orientation="vertical" />
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {ingredients.filter((i) => i.confidence > 0.8).length}
            </div>
            <div className="text-xs text-muted-foreground">높은 신뢰도</div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredient Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">인식된 재료</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {ingredients.map((item) => (
              <Badge
                key={item.id}
                variant={
                  item.confidence > 0.8 ? 'default' : 'outline'
                }
                className="gap-1.5 px-3 py-1.5 text-sm animate-in fade-in zoom-in"
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
                {item.confidence < 0.8 && (
                  <span className="text-xs opacity-60">
                    {Math.round(item.confidence * 100)}%
                  </span>
                )}
                <button
                  onClick={() => removeIngredient(item.id)}
                  className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="flex gap-2">
            <Input
              placeholder="재료 직접 추가 (예: 마늘, 간장)"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button variant="outline" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">재료별 분석 상세</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ingredients.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <span className="text-lg w-8 text-center">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium truncate">
                    {item.name}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">
                    {Math.round(item.confidence * 100)}%
                  </span>
                </div>
                <Progress
                  value={item.confidence * 100}
                  className="h-1.5"
                />
              </div>
              <span className="text-xs text-muted-foreground w-16 text-right">
                ~{item.estimatedShelfLifeDays}일
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Button
        size="lg"
        className="gap-2 text-base"
        onClick={handleGenerateRecipes}
        disabled={ingredients.length === 0}
      >
        <ChefHat className="h-5 w-5" />
        {ingredients.length}개의 재료로 레시피 찾기
      </Button>
    </div>
  )
}
