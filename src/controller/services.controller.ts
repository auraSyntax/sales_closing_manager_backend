import { Body, Controller, Delete, Get, HttpStatus, Param, ParseIntPipe, Post, Put, Query } from "@nestjs/common";
import { PaginatedResponseDto } from "src/dto/paginated.response.dto";
import { ResponseDto } from "src/dto/response.dto";
import { ServiceDto } from "src/dto/services.dto";
import { ServiceException } from "src/exception/service-exception";
import { ServiceService } from "src/service/service.service";

@Controller('services')
export class ServicesController {
    constructor(private readonly serviceservice: ServiceService) { }
    @Post()
    async createService(@Body() serviceDto: ServiceDto): Promise<ResponseDto> {
        return this.serviceservice.createService(serviceDto);
    }

    @Get()
    async getAllServices(@Query('page', ParseIntPipe) page: number, @Query('size', ParseIntPipe) size: number, @Query('search') search: string): Promise<PaginatedResponseDto<ServiceDto>> {
        return this.serviceservice.getAllServices(page, size, search);
    }

    @Get("service-by-id")
    async getServiceById(@Query('serviceId') serviceId: string): Promise<ServiceDto> {
        return this.serviceservice.getServiceById(serviceId);
    }

    @Put()
    async updateService(@Body() serviceDto: ServiceDto): Promise<ResponseDto> {
        return this.serviceservice.updateService(serviceDto);
    }

    @Put("update-status")
    async updateServiceStatus(@Query('id') id: string, @Query('status') status: string): Promise<ResponseDto> {
        const parsedStatus = status === '1' ? true : false;

        return this.serviceservice.updateServiceStatus(id, parsedStatus);
    }

    @Delete(':serviceId')
    async deleteService(@Param('serviceId') serviceId: string): Promise<ResponseDto> {
        if (!serviceId) {
            throw new ServiceException("serviceId can't be blank", "Bad request", HttpStatus.BAD_REQUEST);
        }
        return this.serviceservice.deleteService(serviceId);
    }
}