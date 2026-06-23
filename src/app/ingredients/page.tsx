'use client'

import { useState, useEffect } from 'react'
import {
  List,
  Plus,
  X,
  Bell,
  BellOff,
  AlertTriangle,
  Clock,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  getDaysUntil,
  getExpiryStatus,
} from '@/lib/utils'

interface IngredientItem {
  id: string
  name: string
  emoji: string
  quantity: string
  addedAt: string
  expiresAt: string
  category: string
}

const DEFAULT_INGREDIENTS: IngredientItem[] = [
  {
    id: '1',
    name: '양파',
    emoji: '🧅',
    quantity: '3개',
    addedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    category: 'vegetable',
  },
  {
    id: '2',
    name: '당근',
    emoji: '🥕',
    quantity: '2개',
    addedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    category: 'vegetable',
  },
  {
    id: '3',
    name: '달걀',
    emoji: '🥚',
    quantity: '6개',
    addedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 10 * 86400000).toISOString(),
    category: 'dairy',
  },
  {
    id: '4',
    name: '두부',
    emoji: '🧊',
    quantity: '1모',
    addedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 86400000).toISOString(),
    category: 'other',
  },
  {
    id: '5',
    name: '김치',
    emoji: '🥬',
    quantity: '1/2포기',
    addedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
    category: 'other',
  },
]

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<IngredientItem[]>(DEFAULT_INGREDIENTS)
  const [newName, setNewName] = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'added'>('expiry')

  useEffect(() => {
    const stored = sessionStorage.getItem('fridgeIngredients')
    if (stored) {
      const parsed = JSON.parse(stored)
      setIngredients((prev) => [
        ...parsed.map((p: { name: string; emoji: string; expiresAt?: string }, i: number) => ({
          id: `scan-${i}`,
          name: p.name,
          emoji: p.emoji || '📦',
          quantity: '약간',
          addedAt: new Date().toISOString(),
          expiresAt: p.expiresAt || new Date(Date.now() + 7 * 86400000).toISOString(),
          category: 'other',
        })),
        ...prev,
      ])
      sessionStorage.removeItem('fridgeIngredients')
    }
  }, [])

  const sortedIngredients = [...ingredients].sort((a, b) => {
    if (sortBy === 'expiry') {
      return getDaysUntil(a.expiresAt) - getDaysUntil(b.expiresAt)
    }
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
  })

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id))
    toast.success('재료가 삭제되었어요')
  }

  const addIngredient = () => {
    if (!newName.trim()) {
      toast.error('재료명을 입력해주세요')
      return
    }
    setIngredients((prev) => [
      {
        id: `manual-${Date.now()}`,
        name: newName.trim(),
        emoji: '📦',
        quantity: '약간',
        addedAt: new Date().toISOString(),
        expiresAt: newExpiry
          ? new Date(newExpiry).toISOString()
          : new Date(Date.now() + 7 * 86400000).toISOString(),
        category: 'other',
      },
      ...prev,
    ])
    setNewName('')
    setNewExpiry('')
    setShowAdd(false)
    toast.success(`${newName.trim()} 추가됨`)
  }

  const expiringSoon = ingredients.filter(
    (i) => getDaysUntil(i.expiresAt) >= 0 && getDaysUntil(i.expiresAt) <= 3
  ).length

  const expired = ingredients.filter(
    (i) => getDaysUntil(i.expiresAt) <= 0
  ).length

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 gap-1.5">
          <List className="h-3.5 w-3.5" />
          재료 관리
        </Badge>
        <h1 className="text-3xl font-bold mb-2">
          내 냉장고
        </h1>
        <p className="text-muted-foreground">
          냉장고 속 재료를 관리하고 유통기한을 확인하세요
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{ingredients.length}</div>
            <div className="text-xs text-muted-foreground">전체 재료</div>
          </CardContent>
        </Card>
        <Card className={expiringSoon > 0 ? 'border-amber-200 dark:border-amber-800' : ''}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {expiringSoon}
            </div>
            <div className="text-xs text-muted-foreground">소비 임박</div>
          </CardContent>
        </Card>
        <Card className={expired > 0 ? 'border-red-200 dark:border-red-800' : ''}>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{expired}</div>
            <div className="text-xs text-muted-foreground">유통기한 지남</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() =>
            setSortBy((s) => (s === 'expiry' ? 'name' : s === 'name' ? 'added' : 'expiry'))
          }
        >
          {sortBy === 'expiry' && '유통기한순'}
          {sortBy === 'name' && '이름순'}
          {sortBy === 'added' && '최신순'}
          <ChevronDown className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          className="gap-1.5 ml-auto"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="h-4 w-4" />
          재료 추가
        </Button>
      </div>

      {/* Add Ingredient Form */}
      {showAdd && (
        <Card className="animate-in slide-in-from-top-2">
          <CardContent className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="재료명 (예: 마늘)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                className="flex-1"
              />
              <Input
                type="date"
                value={newExpiry}
                onChange={(e) => setNewExpiry(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
                취소
              </Button>
              <Button size="sm" onClick={addIngredient}>
                <Check className="h-4 w-4 mr-1" />
                추가
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ingredient List */}
      <Card>
        <CardContent className="p-0 divide-y">
          {sortedIngredients.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="mb-2">냉장고에 등록된 재료가 없어요</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdd(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                첫 재료 추가하기
              </Button>
            </div>
          ) : (
            sortedIngredients.map((item) => {
              const status = getExpiryStatus(item.expiresAt)
              const daysLeft = getDaysUntil(item.expiresAt)

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xl w-8 text-center">{item.emoji}</span>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity} ·{' '}
                      {new Date(item.addedAt).toLocaleDateString('ko-KR')} 추가
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {status === 'expired' && (
                      <Badge variant="danger" className="text-xs">
                        기한 지남
                      </Badge>
                    )}
                    {status === 'soon' && (
                      <Badge variant="warning" className="text-xs">
                        D-{daysLeft}
                      </Badge>
                    )}
                    {status === 'fresh' && (
                      <span className="text-xs text-muted-foreground">
                        D-{daysLeft}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeIngredient(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Expiration Tips */}
      {expiringSoon + expired > 0 && (
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                유통기한 임박 재료가 {expiringSoon + expired}개 있어요
              </p>
              <p className="text-amber-600 dark:text-amber-400 mt-1">
                {expired > 0
                  ? `${expired}개의 재료 유통기한이 지났어요. 서둘러 사용해주세요!`
                  : '레시피 추천에서 우선 사용할 재료를 확인하세요.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
