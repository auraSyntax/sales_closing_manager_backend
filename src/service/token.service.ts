import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  email: string;
  userType: string;
  [key: string]: any;
}

export interface TokenInfoDto {
  sub: string | null;
  email: string | null;
  userType: string | null;
}

export class TokenService {

  static decodeToken(token: string): DecodedToken | null {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  // New method to get DTO with sub and email
  static getTokenInfo(token: string): TokenInfoDto {
    const decoded = this.decodeToken(token);
    return {
      sub: decoded?.sub ?? null,
      email: decoded?.email ?? null,
      userType: decoded?.userType ?? null
    };
  }
}
