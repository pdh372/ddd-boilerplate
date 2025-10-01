import { USER_REPOSITORY } from '@module/user/user.token';
import { ORDER_REPOSITORY } from '@module/order/order.token';
import type { IUserRepository } from '@module/user/domain';
import type { IOrderRepository } from '@module/order/domain';
import { GetUserWithCacheUseCase, CreateUserUseCase } from '@module/user/app/use-case';
import {
  CreateOrderUseCase,
  GetOrderUseCase,
  UpdateOrderItemQuantityUseCase,
  AddOrderItemUseCase,
} from '@module/order/app/use-case';
import { CACHE_SERVICE } from '../cache';
import type { ICache } from '@shared/domain/cache';

export const USE_CASE = {
  USER: {
    CREATE_USER: {
      provide: CreateUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (userRepo: IUserRepository) => {
        return new CreateUserUseCase(userRepo);
      },
    },
    GET_USER: {
      provide: GetUserWithCacheUseCase,
      inject: [USER_REPOSITORY, CACHE_SERVICE],
      useFactory: (userRepo: IUserRepository, cacheService: ICache) => {
        return new GetUserWithCacheUseCase(userRepo, cacheService);
      },
    },
  },
  ORDER: {
    CREATE_ORDER: {
      provide: CreateOrderUseCase,
      inject: [ORDER_REPOSITORY],
      useFactory: (orderRepo: IOrderRepository) => {
        return new CreateOrderUseCase(orderRepo);
      },
    },
    GET_ORDER: {
      provide: GetOrderUseCase,
      inject: [ORDER_REPOSITORY],
      useFactory: (orderRepo: IOrderRepository) => {
        return new GetOrderUseCase(orderRepo);
      },
    },
    UPDATE_ORDER_ITEM_QUANTITY: {
      provide: UpdateOrderItemQuantityUseCase,
      inject: [ORDER_REPOSITORY],
      useFactory: (orderRepo: IOrderRepository) => {
        return new UpdateOrderItemQuantityUseCase(orderRepo);
      },
    },
    ADD_ORDER_ITEM: {
      provide: AddOrderItemUseCase,
      inject: [ORDER_REPOSITORY],
      useFactory: (orderRepo: IOrderRepository) => {
        return new AddOrderItemUseCase(orderRepo);
      },
    },
  },
};
