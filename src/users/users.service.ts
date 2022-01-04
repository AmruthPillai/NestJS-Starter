import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';

import { MailService } from '@/mail/mail.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private schedulerRegistry: SchedulerRegistry,
    private mailService: MailService
  ) {}

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ id });

    if (user) {
      return user;
    }

    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });

    if (user) {
      return user;
    }

    throw new HttpException('User with this email does not exist', HttpStatus.NOT_FOUND);
  }

  async findByResetToken(resetToken: string): Promise<User> {
    const user = await this.usersRepository.findOne({ resetToken });

    if (user) {
      return user;
    }

    throw new HttpException(
      'The reset token provided may be invalid or expired.',
      HttpStatus.NOT_FOUND
    );
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);

    await this.usersRepository.save(user);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findById(id);
    const updatedUser = {
      ...user,
      ...updateUserDto,
    };

    await this.usersRepository.save(updatedUser);

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async generateResetToken(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    const resetToken = randomBytes(32).toString('hex');

    const interval = setInterval(async () => {
      await this.usersRepository.update(user.id, { resetToken: null });
    }, 30 * 60 * 1000);

    await this.usersRepository.update(user.id, { resetToken });
    this.schedulerRegistry.addInterval(`clear-resetToken-${user.id}`, interval);

    await this.mailService.sendForgotPasswordEmail(user, resetToken);
  }
}
