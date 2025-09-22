import type { UserAggregate } from '@module/user/domain';
import type { UserResponseDto } from '../dto';

/**
 * Mapper utility for converting domain objects to presentation DTOs
 * Follows DDD principle of keeping domain objects separate from presentation concerns
 */
export class UserMapper {
  /**
   * Converts UserAggregate to UserResponseDto
   * @param user - UserAggregate from domain
   * @returns UserResponseDto for presentation layer
   */
  public static toResponseDto(user: UserAggregate): UserResponseDto {
    return {
      id: user.id.value,
      email: user.email.value,
      name: user.name.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
