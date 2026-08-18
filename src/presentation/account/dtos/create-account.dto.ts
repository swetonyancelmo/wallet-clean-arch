import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome do dono da conta' })
  @IsString()
  @IsNotEmpty()
  ownerName: string;
}
