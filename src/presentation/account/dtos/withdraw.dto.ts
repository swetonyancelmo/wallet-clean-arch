import { IsInt, IsPositive } from 'class-validator';

export class WithdrawDto {
  @IsInt()
  @IsPositive()
  amountInCents: number;
}
