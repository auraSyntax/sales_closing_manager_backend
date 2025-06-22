import { Injectable } from "@nestjs/common";
import { ServiceDto } from "src/dto/services.dto";
import { Services } from "src/entity/services";

@Injectable()
export class ServiceConverter {
    convert(services: Services): ServiceDto {
        return {
            id: services.id,
            serviceName: services.serviceName,
            isActive: services.isActive
        };
    }
}