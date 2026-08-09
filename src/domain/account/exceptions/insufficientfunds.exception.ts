export class InsufficientFundsException extends Error {
  constructor(
    public readonly accountId: string,
    public readonly balanceInCents: number,
    public readonly requestedAmountInCents: number,
  ) {
    super(
      `Saldo insuficiente na conta ${accountId}. Saldo: ${balanceInCents}, solicitado ${requestedAmountInCents}`,
    );
    this.name = 'InsufficientFundsException';
  }
}
