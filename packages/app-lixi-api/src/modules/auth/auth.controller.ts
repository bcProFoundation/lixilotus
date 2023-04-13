import { Body, Controller, Get, HttpException, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import VError from 'verror';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwtauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { mnemonic: string }, @Res({ passthrough: true }) response: FastifyReply): Promise<string> {
    try {
      const { mnemonic } = body;
      const token = await this.authService.login(mnemonic);
      response.setCookie('_auth_token', token, {
        httpOnly: true,
        sameSite: 'none',
        signed: true,
        secure: true,
        path: '/'
      });
      return token;
    } catch (err) {
      if (err instanceof VError) {
        throw new HttpException(err, HttpStatus.INTERNAL_SERVER_ERROR);
      } else {
        const error = new VError.WError(err as Error, 'auth.messages.loginFailed');
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get('csrf')
  @UseGuards(JwtAuthGuard)
  async csrf(@Request() req: FastifyRequest, @Res({ passthrough: true }) response: FastifyReply) {
    const csrfToken = await response.generateCsrf({
      signed: true,
      sameSite: 'strict',
      path: '/api',
      httpOnly: true
    });
    return csrfToken;
  }
}
