import { Inject, Injectable } from '@nestjs/common';
import { EqualAccountsException } from 'src/domain/account/exceptions/equal-accounts.exception';
import { ResourceNotFoundException } from 'src/domain/account/exceptions/resource-not-found.exception';
import { ACCOUNT_REPOSITORY } from 'src/domain/account/repositories/account.repository';
import type { AccountRepository } from 'src/domain/account/repositories/account.repository';

export interface TransferInput {
  fromAccountId: string;
  toAccountId: string;
  amountInCents: number;
}

export interface TransferOutput {
  fromAccountId: string;
  fromAccountNewBalanceInCents: number;
  toAccountId: string;
  toAccountNewBalanceInCents: number;
}

@Injectable()
export class TransferUseCase {
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepository,
  ) {}

  async execute(input: TransferInput): Promise<TransferOutput> {
    if (input.fromAccountId === input.toAccountId) {
      throw new EqualAccountsException(input.fromAccountId, input.toAccountId);
    }

    const [fromAccount, toAccount] = await Promise.all([
      this.accountRepository.findById(input.fromAccountId),
      this.accountRepository.findById(input.toAccountId),
    ]);

    if (fromAccount == null) {
      throw new ResourceNotFoundException(input.fromAccountId);
    }

    if (toAccount == null) {
      throw new ResourceNotFoundException(input.toAccountId);
    }

    fromAccount.withdraw(input.amountInCents);
    toAccount.deposit(input.amountInCents);

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);

    return {
      fromAccountId: fromAccount.id,
      fromAccountNewBalanceInCents: fromAccount.balanceInCents,
      toAccountId: toAccount.id,
      toAccountNewBalanceInCents: toAccount.balanceInCents,
    };
  }
}
