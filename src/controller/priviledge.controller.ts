import { Controller, Get } from "@nestjs/common";
import { PriviledgeDto } from "src/dto/priviledge.dto";
import { PriviledgeService } from "src/service/priviledge.service";

@Controller('priviledge')
export class PriviledgeController {
    constructor(private readonly priviledgeService: PriviledgeService) { }

    @Get()
    async getAllPriviledges(): Promise<PriviledgeDto[]> {
        return this.priviledgeService.getAllPriviledges();
    }

}