import { IsNotEmpty } from "class-validator";

export class PriviledgeDto {
    id: string;

    @IsNotEmpty()
    priviledgeName: string;

}