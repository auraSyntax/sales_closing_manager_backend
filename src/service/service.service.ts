import { Body, HttpStatus, Injectable, Req, Res } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ResponseDto } from "src/dto/response.dto";
import { ServiceDto } from "src/dto/services.dto";
import { Services } from "src/entity/services";
import { Repository } from "typeorm";
import { TokenService } from "./token.service";
import { PaginatedResponseDto } from "src/dto/paginated.response.dto";
import { ServiceException } from "src/exception/service-exception";
import { ServiceConverter } from "src/converter/service.converter";

@Injectable()
export class ServiceService {
    constructor(
        @InjectRepository(Services)
        private readonly serviceRepository: Repository<Services>,
        private readonly serviceConverter: ServiceConverter
    ) { }

    async createService(@Body() serviceDto: ServiceDto): Promise<ResponseDto> {

        const service = await this.convert(serviceDto);
        await this.serviceRepository.save(service);

        return new ResponseDto("Service created successfully");
    }

    async convert(dto: ServiceDto): Promise<Services> {
        const service = new Services();


        if (dto.id) {
            service.id = dto.id;
        }

        service.serviceName = dto.serviceName;
        service.isActive = true;
        return service;
    }


    async getAllServices(
        page: number,
        size: number,
        search: string,
    ): Promise<PaginatedResponseDto<ServiceDto>> {
        const offset = (page - 1) * size;
        const likeSearch = search ? `%${search}%` : '%%';

        const query = this.serviceRepository
            .createQueryBuilder('s')
            .select([
                's.id',
                's.serviceName',
                's.isActive',
            ])
            .where(':search IS NULL OR s.serviceName LIKE :search', { search: likeSearch })
            .skip(offset)
            .take(size);

        const [rawResults, total] = await Promise.all([
            query.getRawMany(),
            this.serviceRepository
                .createQueryBuilder('s')
                .where('s.serviceName LIKE :search', { search: likeSearch })
                .getCount(),
        ]);

        const data = rawResults.map((row) =>
            new ServiceDto(
                row.s_id,
                row.s_service_name,
                row.s_is_active,
            ),
        );

        const totalPages = Math.ceil(total / size);

        const paginatedResponseDto = new PaginatedResponseDto<ServiceDto>();
        paginatedResponseDto.data = data;
        paginatedResponseDto.currentPage = page;
        paginatedResponseDto.totalPages = totalPages;
        paginatedResponseDto.totalItems = total;

        return paginatedResponseDto;
    }

    async getServiceById(serviceId: string): Promise<ServiceDto> {
        const service = await this.serviceRepository.findOne({ where: { id: serviceId } });

        if (!service) {
            throw new ServiceException('Service not found', 'Bad request', HttpStatus.BAD_REQUEST);
        }

        return this.serviceConverter.convert(service);
    }

    async updateService(serviceDto: ServiceDto): Promise<ResponseDto> {
        if (!serviceDto.id) {
            throw new ServiceException('Service ID is required', 'Bad Request', HttpStatus.BAD_REQUEST);
        }

        const service = await this.serviceRepository.findOne({ where: { id: serviceDto.id } });

        if (!service) {
            throw new ServiceException('Service not found', 'Not Found', HttpStatus.NOT_FOUND);
        }

        service.serviceName = serviceDto.serviceName;

        await this.serviceRepository.save(service);

        return new ResponseDto('Service updated successfully');
    }

    async updateServiceStatus(id: string, status: boolean): Promise<ResponseDto> {
        const result = await this.serviceRepository.update(id, { isActive: status });

        if (result.affected === 0) {
            throw new ServiceException('Service not found', 'Bad request', HttpStatus.BAD_REQUEST)
        }

        return new ResponseDto("Service status updated successfully");
    }

    async deleteService(id: string): Promise<ResponseDto> {
        const user = await this.serviceRepository.findOne({ where: { id } });
        if (!user) throw new ServiceException('Service not found', 'Bad request', HttpStatus.BAD_REQUEST);

        await this.serviceRepository.delete(user.id);
        return new ResponseDto("Service deleted")
    }


}