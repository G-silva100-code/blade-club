import { NextResponse } from 'next/server'
import { geocodeAddress, CURITIBA_CENTER } from '@/lib/maps/geocode'

// GET /api/geocode?address=...
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) return NextResponse.json({ error: 'address obrigatório' }, { status: 400 })

  const result = await geocodeAddress(address)

  if (!result) {
    // Sem chave configurada → retorna centro de Curitiba com aviso
    return NextResponse.json({
      ...CURITIBA_CENTER,
      approximate: true,
    })
  }

  return NextResponse.json({ ...result, approximate: false })
}
