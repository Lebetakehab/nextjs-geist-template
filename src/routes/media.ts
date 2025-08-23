import { Router } from 'express';
import multer from 'multer';
import { db } from '../lib/db';
import { ApiResponse } from '../lib/types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/media/upload - Upload media files
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: 'No file uploaded',
      };
      return res.status(400).json(response);
    }

    const { buffer, originalname, mimetype, size } = req.file;
    const teamId = 'demo-team-id';
    
    // Validate file type and size
    const isImage = mimetype.startsWith('image/');
    const isVideo = mimetype.startsWith('video/');
    
    if (!isImage && !isVideo) {
      const response: ApiResponse = {
        success: false,
        error: 'Only images and videos are supported',
      };
      return res.status(400).json(response);
    }

    const maxSize = isImage ? 5 * 1024 * 1024 : 16 * 1024 * 1024; // 5MB for images, 16MB for videos
    
    if (size > maxSize) {
      const response: ApiResponse = {
        success: false,
        error: `File size exceeds ${isImage ? '5MB' : '16MB'} limit`,
      };
      return res.status(400).json(response);
    }

    // In a real implementation, you would upload to cloud storage and WhatsApp
    // For demo purposes, we'll simulate the upload
    const mediaAsset = await db.mediaAsset.create({
      data: {
        teamId,
        filename: originalname,
        type: isImage ? 'IMAGE' : 'VIDEO',
        url: `https://demo-storage.com/${Date.now()}-${originalname}`,
        size,
        providerMediaId: `wa_media_${Date.now()}`,
        metadata: JSON.stringify({
          mimetype,
          originalName: originalname,
        }),
      },
    });

    const response: ApiResponse = {
      success: true,
      data: {
        id: mediaAsset.id,
        filename: mediaAsset.filename,
        type: mediaAsset.type,
        url: mediaAsset.url,
        size: mediaAsset.size,
        providerMediaId: mediaAsset.providerMediaId,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Media upload error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to upload media',
    };
    res.status(500).json(response);
  }
});

// GET /api/media - List media assets
router.get('/', async (req, res) => {
  try {
    const teamId = 'demo-team-id';
    
    const mediaAssets = await db.mediaAsset.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
    });

    const response: ApiResponse = {
      success: true,
      data: mediaAssets,
    };

    res.json(response);
  } catch (error) {
    console.error('Media list error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch media',
    };
    res.status(500).json(response);
  }
});

export default router;
