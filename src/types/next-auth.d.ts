import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      stripeCustomerId?: string | null;
      stripePriceId?: string | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    stripeCustomerId?: string | null;
    stripePriceId?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    stripeCustomerId?: string | null;
    stripePriceId?: string | null;
  }
}
