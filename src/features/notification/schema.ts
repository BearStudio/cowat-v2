import { z } from 'zod';

export const zNotificationChannel = () => z.enum(['SLACK']);
