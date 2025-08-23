import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { db } from '../lib/db';
import { importContactsSchema, ApiResponse } from '../lib/types';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/import/parse - Parse uploaded file
router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      const response: ApiResponse = {
        success: false,
        error: 'No file uploaded',
      };
      return res.status(400).json(response);
    }

    const { buffer, originalname } = req.file;
    let headers: string[] = [];
    let rows: any[][] = [];

    if (originalname.endsWith('.csv')) {
      const csvText = buffer.toString('utf-8');
      const parsed = Papa.parse(csvText, { header: false });
      
      if (parsed.data.length > 0) {
        headers = parsed.data[0] as string[];
        rows = parsed.data.slice(1) as any[][];
      }
    } else if (originalname.endsWith('.xlsx') || originalname.endsWith('.xls')) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length > 0) {
        headers = jsonData[0] as string[];
        rows = jsonData.slice(1) as any[][];
      }
    } else {
      const response: ApiResponse = {
        success: false,
        error: 'Unsupported file format. Please use CSV, XLS, or XLSX.',
      };
      return res.status(400).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        headers,
        rows: rows.slice(0, 1000),
        totalRows: rows.length,
      },
    };

    res.json(response);
  } catch (error) {
    console.error('File parse error:', error);
    
    const response: ApiResponse = {
      success: false,
      error: 'Failed to parse file',
    };
    res.status(500).json(response);
  }
});

export default router;
