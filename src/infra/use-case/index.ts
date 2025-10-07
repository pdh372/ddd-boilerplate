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
  ExportCustomerOrdersUseCase,
} from '@module/order/app/use-case';
import { CACHE_SERVICE } from '../cache';
import type { ICache } from '@shared/domain/cache';
import { DOMAIN_EVENT_SERVICE } from '@shared/shared.token';
import type { DomainEventService } from '@shared/app/service/domain-event.service';

export const USE_CASE = {
  USER: {
    CREATE_USER: {
      provide: CreateUserUseCase,
      inject: [USER_REPOSITORY, DOMAIN_EVENT_SERVICE],
      useFactory: (userRepo: IUserRepository, eventService: DomainEventService) => {
        return new CreateUserUseCase(userRepo, eventService);
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
      inject: [ORDER_REPOSITORY, DOMAIN_EVENT_SERVICE],
      useFactory: (orderRepo: IOrderRepository, eventService: DomainEventService) => {
        return new CreateOrderUseCase(orderRepo, eventService);
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
      inject: [ORDER_REPOSITORY, DOMAIN_EVENT_SERVICE],
      useFactory: (orderRepo: IOrderRepository, eventService: DomainEventService) => {
        return new UpdateOrderItemQuantityUseCase(orderRepo, eventService);
      },
    },
    ADD_ORDER_ITEM: {
      provide: AddOrderItemUseCase,
      inject: [ORDER_REPOSITORY, DOMAIN_EVENT_SERVICE],
      useFactory: (orderRepo: IOrderRepository, eventService: DomainEventService) => {
        return new AddOrderItemUseCase(orderRepo, eventService);
      },
    },
    EXPORT_CUSTOMER_ORDERS: {
      provide: ExportCustomerOrdersUseCase,
      inject: [ORDER_REPOSITORY],
      useFactory: (orderRepo: IOrderRepository) => {
        return new ExportCustomerOrdersUseCase(orderRepo);
      },
    },
  },
};
