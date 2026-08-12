export class EqualAccountsException extends Error {
  constructor(
    public readonly fromAccountId: string,
    public readonly toAccountId: string,
  ) {
    super(`Contas com IDs iguais: ${fromAccountId} e ${toAccountId}`);
    this.name = 'EqualAccountsException';
  }
}
