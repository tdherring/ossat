export interface ApiError {
  code: string;
  message: string;
}

export type ApiErrors = Record<string, ApiError[]>;

export interface MutationPayload {
  success: boolean;
  errors: ApiErrors | null;
}
