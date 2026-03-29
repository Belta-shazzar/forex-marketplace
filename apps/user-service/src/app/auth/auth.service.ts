import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dtos/auth.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email already exists
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await this.userService.findByUsername(registerDto.username);
    if (existingUsername) {
      throw new BadRequestException('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create user
    const user = await this.userService.create({
      email: registerDto.email,
      username: registerDto.username,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phoneNumber: registerDto.phoneNumber,
      isActive: true,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      user: this.userService.toResponseDto(user),
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Find user by email
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.userService.updateLastLogin(user.id);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      user: this.userService.toResponseDto(user),
    };
  }

  async validateUser(payload: any): Promise<User | null> {
    return this.userService.findById(payload.sub);
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id.toString(),
      email: user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload);
  }
}
