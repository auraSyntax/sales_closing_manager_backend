import { Injectable, UnauthorizedException } from "@nestjs/common";
import { RoleDto } from "src/dto/role.dto";
import { Priviledge } from "src/entity/privilege";
import { Role } from "src/entity/role";
import { RolePriviledge } from "src/entity/role_privilege";
import { TokenService } from "src/service/token.service";

@Injectable()
export class RoleConverter {

    convert(roleDto: RoleDto, request: Request): Role {
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            throw new UnauthorizedException('Authorization header missing');
        }

        const token = authHeader.replace('Bearer ', '');
        const tokenInfo = TokenService.getTokenInfo(token);
        const adminId = tokenInfo.sub;

        if (!adminId) {
            throw new UnauthorizedException('Invalid token: adminId is missing');
        }

        const role = new Role();
        role.id = roleDto.id; // For updates; undefined if new
        role.roleName = roleDto.roleName;
        role.isActive = true;
        role.adminId = adminId;

        // Create RolePriviledge entries by assigning entities, NOT IDs
        role.rolePriviledges = roleDto.priviledgeIds.map(privId => {
            const rp = new RolePriviledge();
            const priv = new Priviledge();
            priv.id = privId;

            rp.priviledge = priv;  // assign entity, NOT privilegeId
            rp.role = role;        // assign entity, NOT roleId

            return rp;
        });

        return role;
    }

    convertToDto(role: Role): RoleDto {
        const roleDto = new RoleDto();
        roleDto.id = role.id;
        roleDto.roleName = role.roleName;

        roleDto.priviledgeId = (role.rolePriviledges || [])
            .filter(rp => rp.priviledge)
            .map(rp => ({ id: rp.id,
                role:rp.id, priviledge:rp.priviledge
             })); 

        return roleDto;
    }



}