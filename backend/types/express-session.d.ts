import 'express-session';
import * as session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    user: {
      user_id: string;
      email: string;
      role: string;
      merchant_id?: string;
      merchantRole?: string;
      adminRole?: string;
      admin_id?: string;
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      session: session.Session & Partial<session.SessionData>;
    }
  }
} 