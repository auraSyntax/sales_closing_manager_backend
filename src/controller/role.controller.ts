import { Body, Controller, Get, Post, Put, Query, Req } from "@nestjs/common";
import { ResponseDto } from "src/dto/response.dto";
import { RoleDto } from "src/dto/role.dto";
import { RoleService } from "src/service/role.service";

@Controller('role')
export class RoleController {

    constructor(private readonly roleService: RoleService) { }

    @Post()
    async addRole(@Body() roleDto: RoleDto, @Req() request: Request): Promise<ResponseDto> {
        return this.roleService.addRole(roleDto, request);
    }

    @Put('update-status')
    async updateRoleStatus(@Query('id') id: string, @Query('status') status: string): Promise<ResponseDto> {
        const parsedStatus = status === '1' ? true : false;

        return this.roleService.updateRoleStatus(id, parsedStatus);
    }

    @Get("role-by-id")
    async getRoleById(@Query('roleId') roleId: string): Promise<RoleDto> {
        return this.roleService.getRoleById(roleId);
    }

}