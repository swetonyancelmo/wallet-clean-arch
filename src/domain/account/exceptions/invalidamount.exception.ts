export class InvalidAmountException extends Error {
  constructor(public readonly amountInCents: number) {
    super(`Valor inválido: ${amountInCents}`);
    this.name = 'InvalidAmountException';
  }
}
