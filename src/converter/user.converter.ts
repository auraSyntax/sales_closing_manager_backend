import { Injectable } from "@nestjs/common";
import { UserDto } from "src/dto/user.dto";
import { User } from "src/entity/user";

@Injectable()
export class UserConverter {

    convert(user: User): UserDto {
        return {
            id: user.id,
            fullName: user.fullName,
            companyName: user.companyName,
            email: user.email,
            phoneNo: user.phoneNo,
            logo: user.logo,
            sirenNumber: user.sirenNumber,
            legalName: user.legalName,
            address: user.address,
            nafCode: user.nafCode,
            legalStatus: user.legalStatus,
            workForceSize: user.workForceSize,
            password:user.password,
            userType:user.userType,
            adminId:user.adminId

        };
    }

}