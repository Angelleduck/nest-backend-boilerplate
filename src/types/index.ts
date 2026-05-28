import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
  };
}

interface RefreshRequest extends Request {
  user: {
    id: number;
  };
  cookies: {
    refresh_token: string;
  };
}
export type { AuthenticatedRequest, RefreshRequest };
