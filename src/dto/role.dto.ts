import { IsNotEmpty, IsOptional } from "class-validator";
import { Priviledge } from "src/entity/privilege";

export class RoleDto {
    id: string;

    @IsNotEmpty()
    roleName: string;
    @IsOptional()
    isActive: boolean;
    priviledgeIds: string[]
    adminId: string;

     @IsOptional()
  priviledgeId: Array<{ id: string; role: string; priviledge: Priviledge }>;
}