import { serve } from '@hono/node-server';
import { createMockServer } from './server';

const PORT = parseInt(process.env.PORT || '3001', 10);

const app = createMockServer(PORT);

console.log(`Mock Share API server starting on http://localhost:${PORT}`);
console.log('Endpoints:');
console.log(`  POST /api/upload/presigned - Get presigned URL for upload`);
console.log(`  PUT  /mock-upload/:id      - Upload image data`);
console.log(`  GET  /mock-images/:id.png  - Preview uploaded image`);

serve({
  fetch: app.fetch,
  port: PORT,
});
