import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectId } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateProfileDto, UserResponseDto } from '../dtos/auth.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findById(id: ObjectId): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async updateProfile(id: ObjectId, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.findById(id);
    Object.assign(user, updateProfileDto);
    const updated = await this.userRepository.save(user);
    return this.toResponseDto(updated);
  }

  async updateLastLogin(id: ObjectId): Promise<void> {
    await this.userRepository.update(id, {
      lastLogin: new Date(),
    });
  }

  toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toResponseDtoList(users: User[]): UserResponseDto[] {
    return users.map(user => this.toResponseDto(user));
  }
}
