import { NextRequest, NextResponse } from "next/server"
import { repo } from "@/lib/database/repo"

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || undefined
  const category = searchParams.get("category") || undefined
  const data = repo.listComponents({ q, category })
  return NextResponse.json(data)
}
