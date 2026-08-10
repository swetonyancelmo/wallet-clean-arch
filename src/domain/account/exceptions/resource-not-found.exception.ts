export class ResourceNotFoundException extends Error {
  constructor(private readonly resource: string) {
    super(`Recurso não encontrado: ${resource}`);
    this.name = 'ResourceNotFoundException';
  }
}
