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
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  @ApiOperation({ summary: 'Criar uma conta' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao criar a conta' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  create(@Body() dto: CreateAccountDto) {
    return this.createAccountUseCase.execute({ ownerName: dto.ownerName });
  }

  @Post(':id/deposit')
  @ApiOperation({ summary: 'Depositar valor em uma conta' })
  @ApiResponse({ status: 201, description: 'Valor depositado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao depositar valor' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  deposit(@Param('id') id: string, @Body() dto: DepositDto) {
    return this.depositUseCase.execute({
      accountId: id,
      amountInCents: dto.amountInCents,
    });
  }

  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Retirar valor em uma conta' })
  @ApiResponse({ status: 201, description: 'Valor retirado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao retirar valor' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  withdraw(@Param('id') id: string, @Body() dto: WithdrawDto) {
    return this.withdrawUseCase.execute({
      accountId: id,
      amountInCents: dto.amountInCents,
    });
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transferir valor de uma conta para outra' })
  @ApiResponse({ status: 201, description: 'Valor transferido com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro ao transferir valor' })
  @ApiResponse({ status: 400, description: 'Contas com IDs iguais' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro interno do servidor' })
  transfer(@Param('id') fromAccountId: string, @Body() dto: TransferDto) {
    return this.transferUseCase.execute({
      amountInCents: dto.amountInCents,
      fromAccountId: fromAccountId,
      toAccountId: dto.toAccountId,
    });
  }
}
