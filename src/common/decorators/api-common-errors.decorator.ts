import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../dto/error-response.dto.js';

/** Shob controller e error response gulo ek line e document kore. */
export const ApiCommonErrors = () =>
  applyDecorators(
    ApiBadRequestResponse({ description: 'Validation failed', type: ErrorResponseDto }),
    ApiUnauthorizedResponse({ description: 'Missing or invalid token', type: ErrorResponseDto }),
    ApiForbiddenResponse({ description: 'Insufficient role permissions', type: ErrorResponseDto }),
    ApiTooManyRequestsResponse({ description: 'Rate limit exceeded', type: ErrorResponseDto }),
    ApiInternalServerErrorResponse({ description: 'Unexpected server error', type: ErrorResponseDto }),
  );