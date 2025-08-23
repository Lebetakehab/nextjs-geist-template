import { Router } from 'express';
import { z } from 'zod';
import { db } from '../lib/db';
import { createBatchCampaignSchema, ApiResponse } from '../lib/types';

const router = Router();

// POST /api/campaigns/batch - Create batch campaign with auto-splitting
router.post('/batch', async (req, res) => {
  try {
    const validatedData = createBatchCampaignSchema.parse(req.body);
    
    // For demo purposes, use a default team ID
    const teamId = 'demo-team-id';
    
    // Ensure team exists
    await db.team.upsert({
      where: { id: teamId },
      update: {},
      create: {
        id: teamId,
        name: 'Demo Team',
      },
    });

    // Get valid opted-in contacts
    const validContacts = await db.contact.findMany({
      where: {
        id: { in: validatedData.contacts },
        teamId,
        optInAt: { not: null },
        status: 'ACTIVE',
      },
      take: 2000, // Limit to prevent abuse
    });

    if (validContacts.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'No valid opted-in contacts found',
      };
      return res.status(400).json(response);
    }

    // Create batch campaign
    const batchCampaign = await db.batchCampaign.create({
      data: {
        teamId,
        name: validatedData.name,
        totalContacts: validContacts.length,
        numSubCampaigns: Math.ceil(validContacts.length / 400),
        status: 'DRAFT',
      },
    });

    // Split contacts into sub-campaigns of 400 each
    const subCampaigns = [];
    for (let i = 0; i < validContacts.length; i += 400) {
      const batchContacts = validContacts.slice(i, i + 400);
      
      const campaign = await db.campaign.create({
        data: {
          batchCampaignId: batchCampaign.id,
          teamId,
          name: `${validatedData.name} - Batch ${Math.floor(i / 400) + 1}`,
          status: 'DRAFT',
        },
      });

      // Create message jobs for each contact in this batch
      const messageJobs = batchContacts.map(contact => ({
        campaignId: campaign.id,
        contactId: contact.id,
        payload: JSON.stringify({
          message: validatedData.message,
          mediaId: validatedData.mediaId,
        }),
        status: 'PENDING' as const,
      }));

      await db.messageJob.createMany({
        data: messageJobs,
      });

      subCampaigns.push({
        id: campaign.id,
        name: campaign.name,
        contactCount: batchContacts.length,
      });
    }

    // Update batch campaign status
    await db.batchCampaign.update({
      where: { id: batchCampaign.id },
      data: { status: 'SCHEDULED' },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        batchCampaignId: batchCampaign.id,
        totalContacts: validContacts.length,
        subCampaigns,
        message: `Created ${subCampaigns.length} sub-campaigns for ${validContacts.length} contacts`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Batch campaign creation error:', error);
    
    if (error instanceof z.ZodError) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      };
      return res.status(400).json(response);
    }

    const response: ApiResponse = {
      success: false,
      error: 'Failed to create batch campaign',
    };
    res.status(500).json(response);
  }
});

// GET /api/campaigns - List campaigns
router.get('/', async (req, res) => {
  try {
    const teamId = 'demo-team-id';
    
    const batchCampaigns = await db.batchCampaign.findMany({
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
    });

    const response: ApiResponse = {
      success: true,
      data: batchCampaigns,
    };

    res.json(response);
  } catch (error) {
    console.error('Campaign list error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch campaigns',
    };
    res.status(500).json(response);
  }
});

export default router;
