import { NextRequest, NextResponse } from 'next/server'
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js'
import { z } from 'zod'

const validateSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.any())),
  phoneColumn: z.string(),
  nameColumn: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = validateSchema.parse(body)

    const { headers, rows, phoneColumn, nameColumn } = validatedData

    // Find column indices
    const phoneColumnIndex = headers.indexOf(phoneColumn)
    const nameColumnIndex = nameColumn ? headers.indexOf(nameColumn) : -1

    if (phoneColumnIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phone column not found',
        },
        { status: 400 }
      )
    }

    let validContacts = 0
    let invalidContacts = 0
    let duplicateContacts = 0
    const errors: string[] = []
    const seenNumbers = new Set<string>()

    // Validate each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const phoneValue = row[phoneColumnIndex]

      if (!phoneValue || phoneValue.toString().trim() === '') {
        invalidContacts++
        errors.push(`Row ${i + 2}: Empty phone number`)
        continue
      }

      try {
        // Parse and validate phone number
        const phoneStr = phoneValue.toString().trim()
        
        // Try to parse with different country codes if no country code is provided
        let parsedNumber
        let e164Format

        if (phoneStr.startsWith('+')) {
          // Already has country code
          if (isValidPhoneNumber(phoneStr)) {
            parsedNumber = parsePhoneNumber(phoneStr)
            e164Format = parsedNumber?.format('E.164')
          }
        } else {
          // Try common country codes
          const countryCodes: CountryCode[] = ['US', 'GB', 'CA', 'AU', 'IN']
          for (const countryCode of countryCodes) {
            try {
              if (isValidPhoneNumber(phoneStr, countryCode)) {
                parsedNumber = parsePhoneNumber(phoneStr, countryCode)
                e164Format = parsedNumber?.format('E.164')
                break
              }
            } catch {
              // Continue to next country code
            }
          }
        }

        if (!parsedNumber || !e164Format) {
          invalidContacts++
          errors.push(`Row ${i + 2}: Invalid phone number format: ${phoneStr}`)
          continue
        }

        // Check for duplicates
        if (seenNumbers.has(e164Format)) {
          duplicateContacts++
          errors.push(`Row ${i + 2}: Duplicate phone number: ${e164Format}`)
          continue
        }

        seenNumbers.add(e164Format)
        validContacts++

      } catch (error) {
        invalidContacts++
        errors.push(`Row ${i + 2}: Phone number validation error: ${phoneValue}`)
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        validContacts,
        invalidContacts,
        duplicateContacts,
        errors: errors.slice(0, 10), // Limit to first 10 errors
        totalErrors: errors.length,
      },
    })

  } catch (error) {
    console.error('Validation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate data',
      },
      { status: 500 }
    )
  }
}
