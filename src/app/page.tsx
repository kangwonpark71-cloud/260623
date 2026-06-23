'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Camera,
  ChefHat,
  Sparkles,
  ArrowRight,
  Clock,
  Bell,
  Star,
  Utensils,
} from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: '사진 한 장이면 끝',
    description: '냉장고 사진을 찍으면 AI가 자동으로 재료를 인식해요',
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-950/30',
  },
  {
    icon: Sparkles,
    title: 'AI 맞춤 레시피',
    description: '가진 재료로 만들 수 있는 최적의 레시피를 추천해줘요',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: Clock,
    title: '유통기한 알림',
    description: '유통기한 임박 재료를 알려주고 우선 사용할 레시피를 추천해요',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    icon: Bell,
    title: '푸시 알림',
    description: '유통기한이 다가오면 놓치지 않도록 알려드려요',
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
]

const stats = [
  { value: '10,000+', label: '인식된 재료' },
  { value: '3,000+', label: '레시피' },
  { value: '98%', label: '인식 정확도' },
  { value: '5분', label: '평균 분석 시간' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center pt-12 md:pt-20 gap-6">
        <Badge variant="secondary" className="gap-1.5 px-4 py-1.5 text-sm">
          <Sparkles className="h-3.5 w-3.5" />
          AI 기반 스마트 레시피 추천
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-2xl">
          냉장고를 열면
          <br />
          <span className="text-primary">레시피가 열린다</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
          냉장고 사진 한 장으로 AI가 재료를 분석하고,
          <br />
          맞춤 레시피를 추천해드려요
        </p>

        <div className="flex gap-3 pt-4">
          <Link href="/upload">
            <Button size="lg" className="gap-2 text-base">
              <Camera className="h-5 w-5" />
              시작하기
            </Button>
          </Link>
          <Link href="/recipes">
            <Button variant="outline" size="lg" className="gap-2 text-base">
              <ChefHat className="h-5 w-5" />
              레시피 구경하기
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 w-full max-w-2xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-10">
          3단계로 끝나는
          <br className="sm:hidden" /> 스마트 요리
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            { step: '1', icon: Camera, title: '사진 촬영', desc: '냉장고 속 재료를 사진으로 찍어주세요' },
            { step: '2', icon: Sparkles, title: 'AI 분석', desc: 'AI가 재료를 자동으로 인식하고 분석해요' },
            { step: '3', icon: Utensils, title: '요리 시작', desc: '추천 레시피를 보고 바로 요리해보세요' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-3 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="h-7 w-7" />
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {item.step}
                </span>
                <h3 className="font-semibold text-lg">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-10">
          왜 냉장고 레시피인가요?
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 p-5 rounded-2xl border bg-card text-left hover:shadow-md transition-shadow"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${feature.bg}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-12 max-w-2xl mx-auto">
        <Star className="h-10 w-10 text-primary mx-auto mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          지금 바로 시작해보세요
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          냉장고 사진 한 장으로 오늘의 메뉴를 결정하세요.
          <br />
          음식물 쓰레기도 줄이고, 요리 시간도 절약하세요.
        </p>
        <Link href="/upload">
          <Button size="lg" className="gap-2">
            무료로 시작하기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </section>
    </div>
  )
}
