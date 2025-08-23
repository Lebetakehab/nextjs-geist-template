import { Router } from 'express';
import { z } from 'zod';
import CryptoJS from 'crypto-js';
import { db } from '../lib/db';
import { wabaConfigSchema, ApiResponse } from '../lib/types';

const router = Router();

// POST /api/waba/config - Save WhatsApp configuration
router.post('/config', async (req, res) => {
  try {
    const validatedData = wabaConfigSchema.parse(req.body);
    
    // Encrypt sensitive data
    const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key';
    const encryptedToken = CryptoJS.AES.encrypt(validatedData.accessToken, encryptionKey).toString();
    
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

    // Save or update WABA configuration
    const wabaConfig = await db.wabaConfig.upsert({
      where: { teamId },
      update: {
        wabaPhoneNumberId: validatedData.wabaPhoneNumberId,
        wabaBusinessId: validatedData.wabaBusinessId,
        accessToken: encryptedToken,
        webhookVerifyToken: validatedData.webhookVerifyToken,
        connectionStatus: 'PENDING',
      },
      create: {
        teamId,
        wabaPhoneNumberId: validatedData.wabaPhoneNumberId,
        wabaBusinessId: validatedData.wabaBusinessId,
        accessToken: encryptedToken,
        webhookVerifyToken: validatedData.webhookVerifyToken,
        connectionStatus: 'PENDING',
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: wabaConfig.id,
        status: wabaConfig.connectionStatus,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('WABA config error:', error);
    
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
      error: 'Failed to save configuration',
    };
    res.status(500).json(response);
  }
});

// POST /api/waba/status - Test WhatsApp connection
router.post('/status', async (req, res) => {
  try {
    const validatedData = wabaConfigSchema.parse(req.body);
    
    // In a real implementation, you would test the connection to WhatsApp API
    // For demo purposes, we'll simulate a successful connection
    const response: ApiResponse = {
      success: true,
      data: {
        status: 'CONNECTED',
        phoneNumber: '+1234567890',
        businessName: 'Demo Business',
      },
    };

    res.json(response);
  } catch (error) {
    console.error('WABA status error:', error);
    
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
      error: 'Connection test failed',
    };
    res.status(500).json(response);
  }
});

export default router;
