import { handleRequest, type Router } from '@better-upload/server';
import { createFileRoute } from '@tanstack/react-router';

import { envServer } from '@/env/server';
import { uploadClient } from '@/server/s3';

const router = {
  client: uploadClient,
  bucketName: envServer.S3_BUCKET_NAME,
  routes: {},
} as const satisfies Router;

// Used to type route param on UploadButton component
// This is to prevent typo issues when specifying the uploadRoute prop
export type UploadRoutes = keyof typeof router.routes | 'example';

export const Route = createFileRoute('/api/upload')({
  server: {
    handlers: {
      POST: ({ request }) => {
        return handleRequest(request, router);
      },
    },
  },
});
