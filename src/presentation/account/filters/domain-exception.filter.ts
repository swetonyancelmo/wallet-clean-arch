import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { EqualAccountsException } from 'src/domain/account/exceptions/equal-accounts.exception';
import { InsufficientFundsException } from 'src/domain/account/exceptions/insufficientfunds.exception';
import { InvalidAmountException } from 'src/domain/account/exceptions/invalidamount.exception';
import { ResourceNotFoundException } from 'src/domain/account/exceptions/resource-not-found.exception';

@Catch(
  InvalidAmountException,
  InsufficientFundsException,
  ResourceNotFoundException,
  EqualAccountsException,
)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusMap: Record<string, HttpStatus> = {
      InvalidAmountException: HttpStatus.BAD_REQUEST,
      InsufficientFundsException: HttpStatus.UNPROCESSABLE_ENTITY,
      ResourceNotFoundException: HttpStatus.NOT_FOUND,
      EqualAccountsException: HttpStatus.BAD_REQUEST,
    };

    const status =
      statusMap[exception.name] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      error: exception.name,
      message: exception.message,
    });
  }
}
