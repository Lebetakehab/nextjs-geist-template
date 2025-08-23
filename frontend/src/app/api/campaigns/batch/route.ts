import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const createBatchCampaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required'),
  contacts: z.array(z.string()).min(1, 'At least one contact is required'),
  templateId: z.string().optional(),
  scheduleAt: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createBatchCampaignSchema.parse(body)

    // For demo purposes, we'll use a default team ID
    const teamId = 'demo-team-id'

    // Ensure the team exists
    await prisma.team.upsert({
      where: { id: teamId },
      update: {},
      create: {
        id: teamId,
        name: 'Demo Team',
      },
    })

    // Validate that all contacts exist and are opted in
    const contacts = await prisma.contact.findMany({
      where: {
        id: { in: validatedData.contacts },
        teamId,
        optInAt: { not: null }, // Ensure contacts are opted in
        status: 'ACTIVE',
      },
    })

    if (contacts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid opted-in contacts found',
        },
        { status: 400 }
      )
    }

    if (contacts.length !== validatedData.contacts.length) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${contacts.length} out of ${validatedData.contacts.length} contacts are valid and opted-in`,
        },
        { status: 400 }
      )
    }

    // Auto-batching logic: Split contacts into groups of 400
    const BATCH_SIZE = 400
    const totalContacts = contacts.length
    const numSubCampaigns = Math.ceil(totalContacts / BATCH_SIZE)

    // Create the batch campaign
    const batchCampaign = await prisma.batchCampaign.create({
      data: {
        teamId,
        name: validatedData.name,
        totalContacts,
        numSubCampaigns,
        status: 'DRAFT',
      },
    })

    // Create sub-campaigns
    const campaigns = []
    for (let i = 0; i < numSubCampaigns; i++) {
      const startIndex = i * BATCH_SIZE
      const endIndex = Math.min(startIndex + BATCH_SIZE, totalContacts)
      const batchContacts = contacts.slice(startIndex, endIndex)

      const campaign = await prisma.campaign.create({
        data: {
          batchCampaignId: batchCampaign.id,
          teamId,
          name: `${validatedData.name} - Batch ${i + 1}`,
          templateId: validatedData.templateId,
          scheduleAt: validatedData.scheduleAt ? new Date(validatedData.scheduleAt) : null,
          status: 'DRAFT',
        },
      })

      // Create message jobs for this campaign
      const messageJobs = batchContacts.map(contact => ({
        campaignId: campaign.id,
        contactId: contact.id,
        payload: JSON.stringify({
          type: 'template',
          template: {
            name: 'hello_world', // Default template for demo
            language: 'en',
          },
        }),
        status: 'QUEUED',
      }))

      await prisma.messageJob.createMany({
        data: messageJobs,
      })

      campaigns.push({
        ...campaign,
        contactCount: batchContacts.length,
      })
    }

    // Update batch campaign status to scheduled if all campaigns are created
    await prisma.batchCampaign.update({
      where: { id: batchCampaign.id },
      data: { status: 'SCHEDULED' },
    })

    return NextResponse.json({
      success: true,
      data: {
        batchCampaign: {
          ...batchCampaign,
          status: 'SCHEDULED',
        },
        campaigns,
        message: `Created ${numSubCampaigns} sub-campaigns for ${totalContacts} contacts`,
      },
    })

  } catch (error) {
    console.error('Batch campaign creation error:', error)
    
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
        error: 'Failed to create batch campaign',
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = 'demo-team-id' // For demo purposes
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const [batchCampaigns, total] = await Promise.all([
      prisma.batchCampaign.findMany({
        where: { teamId },
        include: {
          campaigns: {
            include: {
              _count: {
                select: {
                  messageJobs: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.batchCampaign.count({
        where: { teamId },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: batchCampaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })

  } catch (error) {
    console.error('Batch campaigns fetch error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch batch campaigns',
      },
      { status: 500 }
    )
  }
}
