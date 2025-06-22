import { IsNotEmpty, IsOptional } from "class-validator";

export class ServiceDto{
     @IsOptional()
      id?: string;
    
      @IsNotEmpty()
      serviceName: string;

      @IsOptional()
      isActive?: boolean;

      constructor(id: string, serviceName: string, status: boolean) {
    this.id = id;
    this.serviceName = serviceName;
    this.isActive = status;
  }
}