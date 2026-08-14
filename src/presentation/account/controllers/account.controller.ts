import { Body, Controller, Param, Post, UseFilters } from '@nestjs/common';
import { CreateAccountUseCase } from 'src/application/account/use-cases/create-account.use-case';
import { DepositUseCase } from 'src/application/account/use-cases/deposit.use-case';
import { TransferUseCase } from 'src/application/account/use-cases/transfer.use-case';
import { WithdrawUseCase } from 'src/application/account/use-cases/withdraw.use-case';
import { CreateAccountDto } from '../dtos/create-account.dto';
import { DepositDto } from '../dtos/deposit.dto';
import { WithdrawDto } from '../dtos/withdraw.dto';
import { TransferDto } from '../dtos/transfer.dto';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

@Controller('accounts')
@UseFilters(DomainExceptionFilter)
export class AccountController {
  constructor(
    private readonly createAccountUseCase: CreateAccountUseCase,
    private readonly depositUseCase: DepositUseCase,
    private readonly withdrawUseCase: WithdrawUseCase,
    private readonly transferUseCase: TransferUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateAccountDto) {
    return this.createAccountUseCase.execute({ ownerName: dto.ownerName });
  }

  @Post(':id/deposit')
  deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    return this.depositUseCase.execute({
      accountId: id,
      amountInCents: dto.amountInCents,
    });
  }

  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    return this.withdrawUseCase.execute({
      accountId: id,
      amountInCents: dto.amountInCents,
    });
  }

  @Post(':id/transfer')
  transfer(@Param('id') fromAccountId: string, @Body() dto: TransferDto) {
    return this.transferUseCase.execute({
      amountInCents: dto.amountInCents,
      fromAccountId: fromAccountId,
      toAccountId: dto.toAccountId,
    });
  }
}
