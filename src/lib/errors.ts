/**
 * Custom Error Classes for SportManager Application
 * Provides structured error handling with specific error types
 */

export enum ErrorCode {
  // Authentication Errors
  AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS',
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS',
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',

  // Database Errors
  DB_CONNECTION_ERROR = 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR = 'DB_QUERY_ERROR',
  DB_CONSTRAINT_VIOLATION = 'DB_CONSTRAINT_VIOLATION',
  DB_NOT_FOUND = 'DB_NOT_FOUND',

  // Validation Errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_INVALID_INPUT = 'VALIDATION_INVALID_INPUT',
  VALIDATION_MISSING_FIELD = 'VALIDATION_MISSING_FIELD',

  // Business Logic Errors
  BUSINESS_DUPLICATE_ENTRY = 'BUSINESS_DUPLICATE_ENTRY',
  BUSINESS_INVALID_STATE = 'BUSINESS_INVALID_STATE',
  BUSINESS_LIMIT_EXCEEDED = 'BUSINESS_LIMIT_EXCEEDED',

  // Network Errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  NETWORK_SERVER_ERROR = 'NETWORK_SERVER_ERROR',

  // Unknown
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ErrorContext {
  userId?: string;
  resource?: string;
  action?: string;
  metadata?: Record<string, any>;
}

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: ErrorContext
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();

    Error.captureStackTrace(this);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Erro de autenticação',
    code: ErrorCode = ErrorCode.AUTH_INVALID_CREDENTIALS,
    context?: ErrorContext
  ) {
    super(message, code, 401, true, context);
  }
}

/**
 * Authorization Error
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Você não tem permissão para realizar esta ação',
    context?: ErrorContext
  ) {
    super(
      message,
      ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS,
      403,
      true,
      context
    );
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]>;

  constructor(
    message: string = 'Erro de validação',
    fields?: Record<string, string[]>,
    context?: ErrorContext
  ) {
    super(message, ErrorCode.VALIDATION_FAILED, 400, true, context);
    this.fields = fields;
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(
    resource: string = 'Recurso',
    context?: ErrorContext
  ) {
    super(
      `${resource} não encontrado`,
      ErrorCode.DB_NOT_FOUND,
      404,
      true,
      context
    );
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  constructor(
    message: string = 'Erro ao acessar o banco de dados',
    code: ErrorCode = ErrorCode.DB_QUERY_ERROR,
    context?: ErrorContext
  ) {
    super(message, code, 500, true, context);
  }
}

/**
 * Network Error
 */
export class NetworkError extends AppError {
  constructor(
    message: string = 'Erro de conexão',
    code: ErrorCode = ErrorCode.NETWORK_SERVER_ERROR,
    context?: ErrorContext
  ) {
    super(message, code, 503, true, context);
  }
}

/**
 * Business Logic Error
 */
export class BusinessError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.BUSINESS_INVALID_STATE,
    context?: ErrorContext
  ) {
    super(message, code, 422, true, context);
  }
}

/**
 * Error Parser - Converts various error types to AppError
 */
export class ErrorParser {
  static parse(error: unknown, context?: ErrorContext): AppError {
    // Already an AppError
    if (error instanceof AppError) {
      return error;
    }

    // Standard Error
    if (error instanceof Error) {
      return this.parseStandardError(error, context);
    }

    // Supabase Error
    if (this.isSupabaseError(error)) {
      return this.parseSupabaseError(error as any, context);
    }

    // String error
    if (typeof error === 'string') {
      return new AppError(error, ErrorCode.UNKNOWN_ERROR, 500, true, context);
    }

    // Unknown error
    return new AppError(
      'Um erro inesperado ocorreu',
      ErrorCode.UNKNOWN_ERROR,
      500,
      true,
      context
    );
  }

  private static parseStandardError(
    error: Error,
    context?: ErrorContext
  ): AppError {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(
        'Erro de conexão. Verifique sua internet.',
        ErrorCode.NETWORK_OFFLINE,
        context
      );
    }

    return new AppError(error.message, ErrorCode.UNKNOWN_ERROR, 500, true, context);
  }

  private static parseSupabaseError(error: any, context?: ErrorContext): AppError {
    const message = error.message || 'Erro no servidor';

    // Authentication errors
    if (error.status === 401) {
      return new AuthenticationError(
        'Sessão expirada. Faça login novamente.',
        ErrorCode.AUTH_SESSION_EXPIRED,
        context
      );
    }

    // Authorization errors
    if (error.status === 403) {
      return new AuthorizationError(
        'Você não tem permissão para esta operação',
        context
      );
    }

    // Not found
    if (error.status === 404 || error.code === 'PGRST116') {
      return new NotFoundError('Recurso', context);
    }

    // Constraint violations
    if (error.code === '23505') {
      return new BusinessError(
        'Este registro já existe',
        ErrorCode.BUSINESS_DUPLICATE_ENTRY,
        context
      );
    }

    if (error.code === '23503') {
      return new DatabaseError(
        'Operação inválida: registro relacionado não existe',
        ErrorCode.DB_CONSTRAINT_VIOLATION,
        context
      );
    }

    // Generic database error
    return new DatabaseError(message, ErrorCode.DB_QUERY_ERROR, context);
  }

  private static isSupabaseError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      ('status' in error || 'code' in error)
    );
  }
}

/**
 * Error Logger
 */
export class ErrorLogger {
  static log(error: AppError): void {
    const logData = {
      ...error.toJSON(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to error tracking service (Sentry, LogRocket, etc.)
    if (import.meta.env.PROD) {
      // TODO: Integrate with error tracking service
      console.error('[ERROR]', logData);
    } else {
      console.error('[ERROR]', logData);
    }
  }

  static logAndParse(error: unknown, context?: ErrorContext): AppError {
    const appError = ErrorParser.parse(error, context);
    this.log(appError);
    return appError;
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: AppError): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Email ou senha incorretos',
    [ErrorCode.AUTH_SESSION_EXPIRED]: 'Sua sessão expirou. Faça login novamente.',
    [ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS]: 'Você não tem permissão para esta ação',
    [ErrorCode.AUTH_USER_NOT_FOUND]: 'Usuário não encontrado',
    [ErrorCode.DB_CONNECTION_ERROR]: 'Erro de conexão com o servidor',
    [ErrorCode.DB_QUERY_ERROR]: 'Erro ao processar sua solicitação',
    [ErrorCode.DB_CONSTRAINT_VIOLATION]: 'Operação inválida',
    [ErrorCode.DB_NOT_FOUND]: 'Registro não encontrado',
    [ErrorCode.VALIDATION_FAILED]: 'Por favor, verifique os dados informados',
    [ErrorCode.VALIDATION_INVALID_INPUT]: 'Dados inválidos',
    [ErrorCode.VALIDATION_MISSING_FIELD]: 'Preencha todos os campos obrigatórios',
    [ErrorCode.BUSINESS_DUPLICATE_ENTRY]: 'Este registro já existe',
    [ErrorCode.BUSINESS_INVALID_STATE]: 'Operação não permitida no estado atual',
    [ErrorCode.BUSINESS_LIMIT_EXCEEDED]: 'Limite excedido',
    [ErrorCode.NETWORK_TIMEOUT]: 'Tempo de resposta excedido',
    [ErrorCode.NETWORK_OFFLINE]: 'Você está offline',
    [ErrorCode.NETWORK_SERVER_ERROR]: 'Erro no servidor. Tente novamente mais tarde.',
    [ErrorCode.UNKNOWN_ERROR]: 'Ocorreu um erro inesperado',
  };

  return messages[error.code] || error.message;
}
