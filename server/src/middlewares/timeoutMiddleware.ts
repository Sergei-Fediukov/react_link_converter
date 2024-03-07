import { Observable, throwError, TimeoutError } from 'rxjs'

import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common'
import { catchError, timeout } from 'rxjs/operators'

import appConfig from 'src/app.config'

@Injectable()
export class TimeoutMiddleware implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(appConfig().requestTimeout),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException())
        }
        return throwError(() => err)
      }),
    )
  }
}
