'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ImagePlus, Loader2, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export default function UploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleAnalyze = async () => {
    if (!preview) return

    setIsAnalyzing(true)
    try {
      const base64 = preview.split(',')[1]

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || '분석에 실패했습니다')
      }

      const data = await res.json()
      sessionStorage.setItem('scanResult', JSON.stringify(data))
      router.push('/scan-result')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : '분석에 실패했습니다'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <div className="text-center">
        <Badge variant="secondary" className="mb-3 gap-1.5">
          <Camera className="h-3.5 w-3.5" />
          사진 업로드
        </Badge>
        <h1 className="text-3xl font-bold mb-2">냉장고를 찍어주세요</h1>
        <p className="text-muted-foreground">
          냉장고 안의 재료가 잘 보이도록 사진을 찍어주세요
        </p>
      </div>

      <Card
        className={`w-full max-w-md transition-all duration-200 ${
          dragOver
            ? 'border-primary ring-2 ring-primary/20'
            : preview
            ? ''
 : ''
        }`}
      >
        <CardContent className="p-6">
          {!preview ? (
            <div
              className="flex flex-col items-center justify-center gap-4 py-12 cursor-pointer"
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
                <ImagePlus className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold">사진 업로드</p>
                <p className="text-sm text-muted-foreground mt-1">
                  클릭하거나 드래그하여 업로드
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP (최대 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <img
                  src={preview}
                  alt="냉장고 사진"
                  className="w-full rounded-xl object-cover max-h-96"
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                  onClick={handleReset}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleReset}
                >
                  다시 찍기
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      분석 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      AI 분석 시작
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground max-w-md">
        <p className="font-medium mb-2">💡 촬영 팁</p>
        <ul className="space-y-1">
          <li>• 냉장고 불을 켜고 촬영해주세요</li>
          <li>• 재료가 겹치지 않도록 펼쳐주세요</li>
          <li>• 여러 번 나누어 찍어도 좋아요</li>
        </ul>
      </div>
    </div>
  )
}
