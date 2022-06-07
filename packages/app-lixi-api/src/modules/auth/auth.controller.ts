import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import {
  FastifyReply,
  FastifyRequest
} from 'fastify';
import { AuthService } from './auth.service';
import { CsrfGuard } from './csrf.guard';
import { JwtAuthGuard } from './jwtauth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private adapterHost: HttpAdapterHost
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

    const unsginedCookie = response.unsignCookie(req.cookies['_csrf'] || '').value;
    const csrfToken = await response.generateCsrf();
    return csrfToken;
  }

  @Post('testjwt')
  @UseGuards(JwtAuthGuard)
  async testjwt(@Request() req: FastifyRequest, @Body() body: { value: string }): Promise<string> {
    return body.value;
  }

  @Post('testguard')
  @UseGuards(CsrfGuard)
  async testguard(@Request() req: FastifyRequest, @Body() body: { value: string }): Promise<string> {
    return body.value;
  }

}