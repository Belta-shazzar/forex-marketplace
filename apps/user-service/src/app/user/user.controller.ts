import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { UpdateProfileDto, UserResponseDto } from '../dtos/auth.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() request: any): Promise<UserResponseDto> {
    const user = request.user;
    return this.userService.toResponseDto(user);
  }

  @Put('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(
    @Req() request: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    const user = request.user;
    return this.userService.updateProfile(user.id, updateProfileDto);
  }
}
