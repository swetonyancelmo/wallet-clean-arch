import { IsInt, IsPositive, IsUUID } from 'class-validator';

export class TransferDto {
  @IsUUID()
  toAccountId: string;

  @IsPositive()
  @IsInt()
  amountInCents: number;
}
