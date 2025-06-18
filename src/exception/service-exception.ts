import { HttpException, HttpStatus } from '@nestjs/common';

export class ServiceException extends HttpException {
  public readonly headerMessage: string;
  public readonly errors: string[];

  constructor(
    messageOrErrors: string | string[],
    headerMessage: string,
    status: HttpStatus,
  ) {
    // Create combined message for HttpException's message parameter
    const combinedMessage = Array.isArray(messageOrErrors)
      ? messageOrErrors.join('; ')
      : messageOrErrors;

    super(combinedMessage, status);

    this.headerMessage = headerMessage;
    this.errors = Array.isArray(messageOrErrors)
      ? messageOrErrors
      : [messageOrErrors];
  }
}
