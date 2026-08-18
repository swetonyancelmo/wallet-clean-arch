import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: '5000', description: 'Quantia para ser depositada' })
  @IsPositive()
  @IsInt()
  amountInCents: number;
}
