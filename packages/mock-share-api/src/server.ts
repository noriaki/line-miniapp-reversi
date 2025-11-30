import { Hono } from 'hono';
import { cors } from 'hono/cors';

const MAX_FILE_SIZE = 1048576; // 1MB
const EXPIRES_IN = 300; // 5 minutes

interface PresignedUrlRequest {
  contentType: string;
  fileSize: number;
}

interface PresignedUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
}

function generateImageId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function createMockServer(port: number = 3001): Hono {
  const app = new Hono();

  // Enable CORS for all routes
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PUT', 'OPTIONS'],
      allowHeaders: ['Content-Type'],
    })
  );

  // POST /api/upload/presigned - Generate presigned URL for upload
  app.post('/api/upload/presigned', async (c) => {
    let body: PresignedUrlRequest;

    try {
      body = await c.req.json<PresignedUrlRequest>();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    // Validate required fields
    if (!body.contentType || typeof body.fileSize !== 'number') {
      return c.json(
        { error: 'Missing required fields: contentType, fileSize' },
        400
      );
    }

    // Validate content type (only image/png allowed)
    if (body.contentType !== 'image/png') {
      return c.json({ error: 'Only image/png content type is allowed' }, 400);
    }

    // Validate file size (max 1MB)
    if (body.fileSize > MAX_FILE_SIZE) {
      return c.json({ error: 'File size exceeds maximum allowed (1MB)' }, 413);
    }

    const imageId = generateImageId();
    const baseUrl = `http://localhost:${port}`;

    const response: PresignedUrlResponse = {
      uploadUrl: `${baseUrl}/mock-upload/${imageId}`,
      publicUrl: `${baseUrl}/mock-images/${imageId}.png`,
      expiresIn: EXPIRES_IN,
    };

    return c.json(response);
  });

  // PUT /mock-upload/:id - Accept image upload (mock - just returns 204)
  app.put('/mock-upload/:id', async (c) => {
    // In a real implementation, we would save the image data
    // For mock purposes, we just acknowledge the upload
    return c.body(null, 204);
  });

  // GET /mock-images/:filename - Serve placeholder image
  app.get('/mock-images/:filename', async (c) => {
    // Return a minimal 1x1 transparent PNG as placeholder
    const transparentPng = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    return c.body(transparentPng, 200, {
      'Content-Type': 'image/png',
    });
  });

  return app;
}
