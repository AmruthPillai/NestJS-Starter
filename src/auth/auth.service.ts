import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SchedulerRegistry } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';

import { PostgresErrorCode } from '@/database/errorCodes.enum';
import { User } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenPayload } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private schedulerRegistry: SchedulerRegistry,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    try {
      const createdUser = await this.usersService.create({
        ...registerDto,
        password: hashedPassword,
      });

      return createdUser;
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException('A user with that email already exists', HttpStatus.BAD_REQUEST);
      }

      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUser(email: string, password: string): Promise<User> {
    try {
      const user = await this.usersService.findByEmail(email);

      await this.verifyPassword(password, user.password);

      return user;
    } catch (error) {
      throw new HttpException(
        'The username/password provided was incorrect.',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<void> {
    const isPasswordMatching = await bcrypt.compare(password, hashedPassword);

    if (!isPasswordMatching) {
      throw new HttpException(
        'The username/password provided was incorrect.',
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      await this.usersService.generateResetToken(email);
    } catch {}
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const user = await this.usersService.findByResetToken(resetPasswordDto.token);
    const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

    await this.usersService.update(user.id, { password: hashedPassword, resetToken: null });
    this.schedulerRegistry.deleteInterval(`clear-resetToken-${user.id}`);
  }

  getAuthCookie(id: number): string {
    const payload: TokenPayload = { id };
    const token = this.jwtService.sign(payload);
    const jwtExpiryTime = this.configService.get<number>('auth.jwtExpiryTime');

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${jwtExpiryTime}`;
  }

  getLogoutCookie(): string {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}
