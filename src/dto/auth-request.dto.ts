import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthRequestDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    password: string;
}