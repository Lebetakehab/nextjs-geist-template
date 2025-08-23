import { NextRequest, NextResponse } from 'next/server'
import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const importContactsSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.array(z.any())),
  phoneColumn: z.string(),
  nameColumn: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = importContactsSchema.parse(body)

    const { headers, rows, phoneColumn, nameColumn } = validatedData
    const teamId = 'demo-team-id'

    await prisma.team.upsert({
      where: { id: teamId },
      update: {},
      create: {
        id: teamId,
        name: 'Demo Team',
      },
    })

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
    const contactsToCreate: any[] = []
    const seenNumbers = new Set<string>()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const phoneValue = row[phoneColumnIndex]
      const nameValue = nameColumnIndex >= 0 ? row[nameColumnIndex] : null

      if (!phoneValue || phoneValue.toString().trim() === '') {
        invalidContacts++
        continue
      }

      try {
        const phoneStr = phoneValue.toString().trim()
        let parsedNumber
        let e164Format

        if (phoneStr.startsWith('+')) {
          if (isValidPhoneNumber(phoneStr)) {
            parsedNumber = parsePhoneNumber(phoneStr)
            e164Format = parsedNumber?.format('E.164')
          }
        } else {
          const countryCodes: CountryCode[] = ['US', 'GB', 'CA', 'AU', 'IN']
          for (const countryCode of countryCodes) {
            try {
              if (isValidPhoneNumber(phoneStr, countryCode)) {
                parsedNumber = parsePhoneNumber(phoneStr, countryCode)
                e164Format = parsedNumber?.format('E.164')
                break
              }
            } catch {
              continue
            }
          }
        }

        if (!parsedNumber || !e164Format) {
          invalidContacts++
          continue
        }

        if (seenNumbers.has(e164Format)) {
          duplicateContacts++
          continue
        }

        seenNumbers.add(e164Format)

        const contactData = {
          teamId,
          e164: e164Format,
          name: nameValue ? nameValue.toString().trim() : null,
          status: 'ACTIVE',
          optInAt: new Date(),
        }

        contactsToCreate.push(contactData)
        validContacts++

      } catch (error) {
        invalidContacts++
      }
    }

    const existingContacts = await prisma.contact.findMany({
      where: {
        teamId,
        e164: {
          in: contactsToCreate.map(c => c.e164),
        },
      },
      select: { e164: true },
    })

    const existingNumbers = new Set(existingContacts.map(c => c.e164))
    const newContacts = contactsToCreate.filter(c => !existingNumbers.has(c.e164))
    const existingCount = contactsToCreate.length - newContacts.length

    if (newContacts.length > 0) {
      await prisma.contact.createMany({
        data: newContacts,
        skipDuplicates: true,
      })
    }

    const importBatch = await prisma.importBatch.create({
      data: {
        teamId,
        filename: `import_${Date.now()}.csv`,
        totalRows: rows.length,
        validRows: validContacts,
        invalidRows: invalidContacts,
        status: 'COMPLETED',
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        importBatch: {
          id: importBatch.id,
          totalRows: importBatch.totalRows,
          validRows: importBatch.validRows,
          invalidRows: importBatch.invalidRows,
        },
        validContacts,
        invalidContacts,
        duplicateContacts: duplicateContacts + existingCount,
        newContacts: newContacts.length,
        existingContacts: existingCount,
      },
    })

  } catch (error) {
    console.error('Import contacts error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to import contacts',
      },
      { status: 500 }
    )
  }
}
