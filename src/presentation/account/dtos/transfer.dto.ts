import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    example: 1,
    description: 'ID da conta que irá receber a transferência',
  })
  @IsUUID()
  toAccountId: string;

  @ApiProperty({ example: '5000', description: 'Quantia para ser transferida' })
  @IsPositive()
  @IsInt()
  amountInCents: number;
}
