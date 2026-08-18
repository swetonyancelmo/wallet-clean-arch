import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ example: '5000', description: 'Quantia para ser retirada' })
  @IsInt()
  @IsPositive()
  amountInCents: number;
}
