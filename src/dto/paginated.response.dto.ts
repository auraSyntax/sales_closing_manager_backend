export class PaginatedResponseDto<T> {
  totalItems: number;
  data: T[];
  totalPages: number;
  currentPage: number;
}