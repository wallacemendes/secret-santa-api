export class ResponseDto<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly errors?: unknown;
}
