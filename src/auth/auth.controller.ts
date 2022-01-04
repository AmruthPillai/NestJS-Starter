import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';

import { User } from '@/decorators/user.decorator';
import { User as UserEntity } from '@/users/entities/user.entity';

import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import JwtAuthGuard from './guards/jwt.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  authenticate(@User() user: UserEntity): UserEntity {
    return user;
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserEntity> {
    return this.authService.register(registerDto);
  }

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @User() user: UserEntity,
    @Res({ passthrough: true }) response: Response
  ): Promise<UserEntity> {
    const cookie = this.authService.getAuthCookie(user.id);

    response.header('Set-Cookie', cookie);

    return user;
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): void {
    response.cookie('Authentication', null);
  }

  @HttpCode(200)
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @HttpCode(200)
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
