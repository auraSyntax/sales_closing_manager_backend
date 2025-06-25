import { Body, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleConverter } from "src/converter/role.converter";
import { ResponseDto } from "src/dto/response.dto";
import { RoleDto } from "src/dto/role.dto";
import { Role } from "src/entity/role";
import { ServiceException } from "src/exception/service-exception";
import { Repository } from "typeorm";

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>,
        private readonly roleConverter: RoleConverter
    ) { }

    async addRole(roleDto: RoleDto, request: Request): Promise<ResponseDto> {
        this.roleRepository.save(this.roleConverter.convert(roleDto, request))
        return new ResponseDto("Role saved")
    }

    async updateRoleStatus(id: string, status: boolean): Promise<ResponseDto> {
        const result = await this.roleRepository.update(id, { isActive: status });

        if (result.affected === 0) {
            throw new ServiceException('Service not found', 'Bad request', HttpStatus.BAD_REQUEST)
        }

        return new ResponseDto("Role status updated successfully");
    }

    async getRoleById(roleId: string): Promise<RoleDto> {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });

        if (!role) {
            throw new ServiceException('Role not found', 'Bad request', HttpStatus.BAD_REQUEST);
        }

        return this.roleConverter.convertToDto(role);
    }
}