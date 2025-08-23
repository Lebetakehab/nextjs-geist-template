import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No file provided',
        },
        { status: 400 }
      )
    }

    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv')
    const isExcel = file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

    if (!isCSV && !isExcel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Only CSV and Excel files are supported',
        },
        { status: 400 }
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size exceeds 10MB limit',
        },
        { status: 400 }
      )
    }

    let headers: string[] = []
    let rows: any[][] = []

    if (isCSV) {
      const text = await file.text()
      const result = Papa.parse(text, {
        header: false,
        skipEmptyLines: true,
      })

      if (result.errors.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to parse CSV file',
          },
          { status: 400 }
        )
      }

      const data = result.data as string[][]
      if (data.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'File is empty',
          },
          { status: 400 }
        )
      }

      headers = data[0]
      rows = data.slice(1)
    } else {
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
      
      if (jsonData.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'File is empty',
          },
          { status: 400 }
        )
      }

      headers = jsonData[0]
      rows = jsonData.slice(1)
    }

    const cleanHeaders = headers.filter(header => header && header.toString().trim())
    
    if (cleanHeaders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid headers found',
        },
        { status: 400 }
      )
    }

    const cleanRows = rows.filter(row => 
      row && row.some(cell => cell !== null && cell !== undefined && cell.toString().trim())
    )

    return NextResponse.json({
      success: true,
      data: {
        headers: cleanHeaders,
        rows: cleanRows,
        totalRows: cleanRows.length,
      },
    })

  } catch (error) {
    console.error('File parse error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse file',
      },
      { status: 500 }
    )
  }
}
