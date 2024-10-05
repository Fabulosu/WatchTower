import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: number;
            email: string;
            name: string;
        };

        backendTokens: {
            accessToken: string;
            refreshToken: string;
        };
    }

    interface User {
        id: number;
        email: string;
        name: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        user: {
            id: number;
            email: string;
            name: string;
        };

        backendTokens: {
            accessToken: string;
            refreshToken: string;
        };
    }
}