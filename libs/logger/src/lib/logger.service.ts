import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  log(message: string, context?: string) {
    super.log(message, context || 'App');
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || 'App');
  }

  warn(message: string, context?: string) {
    super.warn(message, context || 'App');
  }

  debug(message: string, context?: string) {
    super.debug(message, context || 'App');
  }
}
