import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TokenService } from 'src/service/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly openPaths = ['/auth/login', '/auth/refresh-token', '/auth/forgot-password', '/auth/reset-password']; // Note the leading slash here

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const path = request.path;

        // Skip JWT validation for open paths
        if (this.openPaths.includes(path)) {
            return true;
        }

        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Authorization header missing or malformed');
        }

        const token = authHeader.split(' ')[1];
        const decoded = TokenService.decodeToken(token);
        if (!decoded) {
            throw new UnauthorizedException('Invalid or expired token');
        }

        // Attach user info to request for later use in controllers
        (request as any).user = decoded;
        return true;
    }
}
