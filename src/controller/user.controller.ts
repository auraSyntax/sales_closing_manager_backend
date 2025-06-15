import { Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ResponseDto } from 'src/dto/response.dto';
import { UserDto } from 'src/dto/user.dto';
import { PaginatedResponseDto } from 'src/dto/paginated.response.dto';
import { UserResponseDto } from 'src/dto/user.response.dto';
import { UpdateCredentialsDto } from 'src/dto/user.credentials.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  createUser(@Body() userDto: UserDto): Promise<ResponseDto> {
    return this.userService.createUser(userDto);
  }

  @Get()
  // @UseGuards(ManagerGuard)
  async getAllUsers(@Query('page', ParseIntPipe) page: number, @Query('size', ParseIntPipe) size: number, @Query('search') search: string): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.userService.getAllUsers(page, size, search);
  }

  @Get(':userId')
  async getUserById(@Param('userId') userId: string): Promise<UserDto> {
    if (!userId) {
      throw new NotFoundException("userId can't be blank");
    }
    return this.userService.getUserById(userId);
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string): Promise<ResponseDto> {
    if (!userId) {
      throw new NotFoundException("userId can't be blank");
    }
    return this.userService.deleteUser(userId);
  }

  @Put()
  async updateUserStatus(@Query('id') id: string, @Query('status') status: string): Promise<ResponseDto> {
    const parsedStatus = status === '1' ? true : false;

    return this.userService.updateUserStatus(id, parsedStatus);
  }

  @Put('user-credentials')
  async updateUserCredentials(@Body() dto: UpdateCredentialsDto): Promise<ResponseDto> {
    return this.userService.updateUserCredentials(dto);
  }
}
