import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import {
  FastifyReply,
  FastifyRequest
} from 'fastify';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwtauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService
  ) {
  }

  @Post('login')
  async login(@Body() body: { mnemonic: string }, @Res({ passthrough: true }) response: FastifyReply): Promise<string> {
    try {
      const { mnemonic } = body;
      const token = await this.authService.login(mnemonic);
      response.setCookie('_auth_token', token, {
        httpOnly: true,
        sameSite: 'strict',
        signed: true,
        path: '/api'
      });
      return token;
    } catch (err) {
      throw err;
    }
  }

  @Get('csrf')
  @UseGuards(JwtAuthGuard)
  async csrf(@Request() req: FastifyRequest, @Res({ passthrough: true }) response: FastifyReply) {
    const csrfToken = await response.generateCsrf({
      signed: true,
      sameSite: 'strict',
      path: '/api',
      httpOnly: true,
    });
    return csrfToken;
  }
}