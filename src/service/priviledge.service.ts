import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Priviledge } from "src/entity/privilege";
import { Repository } from "typeorm";
import { PriviledgeDto } from "src/dto/priviledge.dto";
import { PriviledgeConverter } from "src/converter/priviledge.converter";

@Injectable()
export class PriviledgeService {
    constructor(
        @InjectRepository(Priviledge)
        private readonly priviledgeRepository: Repository<Priviledge>,
        private readonly priviledgeConverter: PriviledgeConverter
    ) {}

    async getAllPriviledges(): Promise<PriviledgeDto[]> {
        const priviledges = await this.priviledgeRepository.find();
        return priviledges.map(p => this.priviledgeConverter.convert(p));
    }
}
