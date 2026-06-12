import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './users.repository';
import { BaseException } from 'src/common/exceptions/base.exception';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const duplicateUser = await this.userRepository.findOne({
      where: { phone: createUserDto.phone },
    });

    if (duplicateUser) {
      throw new BaseException(
        'User with this phone number already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.findAll();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User');
    }
    return user;
  }

  async findOne(filter: Partial<Record<keyof User, any>>) {
    const user = await this.userRepository.findOne({ where: filter });
    if (!user) {
      throw new NotFoundException('User');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findById(id);
    await this.userRepository.delete(id);
    return {
      message: 'User deleted successfully',
    };
  }
}
