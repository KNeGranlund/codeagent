import { NextRequest, NextResponse } from "next/server"
import { repo } from "@/lib/database/repo"

export function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const calc = repo.getCalculation(params.id)
  if (!calc) {
    return NextResponse.json({ error: "Calculation not found" }, { status: 404 })
  }
  return NextResponse.json(calc)
}

export function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return req.json().then(data => {
    const calc = repo.saveCalculation(data)
    return NextResponse.json(calc)
  })
}

export function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  repo.deleteCalculation(params.id)
  return NextResponse.json({ success: true })
}
