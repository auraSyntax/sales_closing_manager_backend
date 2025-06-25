import { Injectable } from "@nestjs/common";
import { PriviledgeDto } from "src/dto/priviledge.dto";
import { Priviledge } from "src/entity/privilege";

@Injectable()
export class PriviledgeConverter{
    convert(priviledge: Priviledge): PriviledgeDto {
            return {
                id: priviledge.id,
                priviledgeName: priviledge.privilege,
            };
        }
}