import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Put, Query, Req } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ResponseDto } from 'src/dto/response.dto';
import { UserDto } from 'src/dto/user.dto';
import { PaginatedResponseDto } from 'src/dto/paginated.response.dto';
import { UserResponseDto } from 'src/dto/user.response.dto';
import { UpdateCredentialsDto } from 'src/dto/user.credentials.dto';
import { CurrentUserDetailsDto } from 'src/dto/current-user-details.dto';
import { ServiceException } from 'src/exception/service-exception';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  async createUser(@Body() userDto: UserDto, @Req() request: Request): Promise<ResponseDto> {
    return this.userService.createUser(userDto, request);
  }

  @Get()
  async getAllUsers(@Query('page', ParseIntPipe) page: number, @Query('size', ParseIntPipe) size: number, @Query('search') search: string, @Req() request: Request): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.userService.getAllUsers(page, size, search, request);
  }

  @Get('user-by-id')
  async getUserById(@Query('userId') userId: string): Promise<UserDto> {
    if (!userId) {
      throw new ServiceException("userId can't be blank", "Bad Request", HttpStatus.BAD_REQUEST);
    }
    return this.userService.getUserById(userId);
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string): Promise<ResponseDto> {
    if (!userId) {
      throw new ServiceException("userId can't be blank", "Bad Request", HttpStatus.BAD_REQUEST);
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

  @Get('current-user')
  async getCurrentUserDetails(@Req() request: Request): Promise<CurrentUserDetailsDto> {
    return this.userService.getCurrentUserDetails(request);
  }

}
