import { IsInt, IsPositive } from 'class-validator';

export class DepositDto {
  @IsPositive()
  @IsInt()
  amountInCents: number;
}
