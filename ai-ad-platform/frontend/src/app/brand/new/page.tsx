"use client"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"
import Header from "@/components/layout/Header"
import BrandAnalyzer from "@/components/brand/BrandAnalyzer"
import { Brand } from "@/lib/types"

export default function NewBrandPage() {
  const router = useRouter()

  const handleComplete = (brand: Brand) => {
    router.push(`/brand/${(brand as any).id}`)
  }

  return (
    <AppLayout>
      <Header title="Add New Brand" description="Analyze a brand website to get started" />
      <div className="p-6">
        <BrandAnalyzer onComplete={handleComplete} />
      </div>
    </AppLayout>
  )
}
