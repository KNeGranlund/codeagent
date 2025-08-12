import { NextRequest, NextResponse } from "next/server"
import { repo } from "@/lib/database/repo"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const calc = repo.getCalculation(id)
  if (!calc) {
    return NextResponse.json({ error: "Calculation not found" }, { status: 404 })
  }
  return NextResponse.json(calc)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const data = await req.json()
  const calc = repo.saveCalculation(data)
  return NextResponse.json(calc)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  repo.deleteCalculation(id)
  return NextResponse.json({ success: true })
}
