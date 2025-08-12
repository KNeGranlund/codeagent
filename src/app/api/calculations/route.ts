import { NextResponse } from "next/server"
import { repo } from "@/lib/database/repo"

export function GET() {
  const data = repo.listCalculations()
  return NextResponse.json(data)
}
