import { Injectable, Logger } from '@nestjs/common';
import { ResultSpecification } from '@shared/domain/specification';
import type { UserAggregate } from '@module/user/domain/aggregate';
import type { OrderAggregate } from '@module/order/domain/aggregate';
import { OrderItemEntity } from '../entity';

export interface PricingResult {
  originalTotal: number;
  adjustedTotal: number;
  priceAdjustments: Array<{
    reason: string;
    type: 'increase' | 'decrease';
    amount: number;
    percentage?: number;
  }>;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface DiscountResult {
  totalDiscount: number;
  appliedDiscounts: Array<{
    type: 'loyalty' | 'volume' | 'seasonal' | 'promo' | 'first-time';
    amount: number;
    code?: string;
    description: string;
  }>;
}

/**
 * Advanced Pricing Domain Service - Example of Complex Business Logic
 * Demonstrates enterprise-grade domain service with sophisticated pricing rules
 */
@Injectable()
export class PricingDomainService {
  private readonly logger = new Logger(PricingDomainService.name);

  calculateDynamicPricing(
    user: UserAggregate,
    items: OrderItemEntity[],
    marketConditions = { demand: 1.0, seasonality: 1.0 },
  ): Promise<ResultSpecification<PricingResult>> {
    return new Promise((resolve) => {
      try {
        // Complex business logic: Dynamic pricing based on multiple factors
        const originalTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const userTier = this.calculateUserTier(user);

        // Multi-factor pricing adjustments
        const tierAdjustment = this.getTierPriceAdjustment(userTier, originalTotal);
        const demandAdjustment = this.calculateDemandAdjustment(marketConditions.demand, items);
        const seasonalAdjustment = this.calculateSeasonalAdjustment(marketConditions.seasonality, items);
        const volumeAdjustment = this.calculateVolumeAdjustment(items);

        const priceAdjustments = [tierAdjustment, demandAdjustment, seasonalAdjustment, volumeAdjustment].filter(
          (adj) => adj.amount !== 0,
        );

        const totalAdjustment = priceAdjustments.reduce(
          (sum, adj) => sum + (adj.type === 'increase' ? adj.amount : -adj.amount),
          0,
        );

        const adjustedTotal = Math.max(originalTotal + totalAdjustment, originalTotal * 0.5);

        this.logger.debug(`Complex pricing calculated for user ${user.id.value}: ${originalTotal} -> ${adjustedTotal}`);

        resolve(
          ResultSpecification.ok({
            originalTotal,
            adjustedTotal,
            priceAdjustments,
            tier: userTier,
          }),
        );
      } catch (error) {
        this.logger.error('Failed to calculate dynamic pricing:', error);
        resolve(
          ResultSpecification.fail({
            errorKey: 'PRICING_CALCULATION_ERROR',
            errorParam: { error: String(error) },
          }),
        );
      }
    });
  }

  async calculateDiscounts(
    user: UserAggregate,
    order: OrderAggregate,
    promoCode?: string | null,
  ): Promise<ResultSpecification<DiscountResult>> {
    try {
      const appliedDiscounts: DiscountResult['appliedDiscounts'] = [];

      // Complex discount rules combining multiple business factors
      const loyaltyDiscount = this.calculateLoyaltyDiscount(user);
      if (loyaltyDiscount > 0) {
        appliedDiscounts.push({
          type: 'loyalty',
          amount: loyaltyDiscount,
          description: `Loyalty discount for ${this.calculateUserTier(user)} tier member`,
        });
      }

      const orderValue = order.totalAmount;
      const volumeDiscount = this.calculateVolumeDiscount(orderValue);
      if (volumeDiscount > 0) {
        appliedDiscounts.push({
          type: 'volume',
          amount: volumeDiscount,
          description: `Volume discount for order over $${orderValue}`,
        });
      }

      const seasonalDiscount = this.calculateSeasonalDiscount(new Date(), orderValue);
      if (seasonalDiscount > 0) {
        appliedDiscounts.push({
          type: 'seasonal',
          amount: seasonalDiscount,
          description: 'Seasonal promotion discount',
        });
      }

      // Complex business rule: First-time customer identification
      const isFirstOrder = await this.isFirstTimeCustomer(user);
      if (isFirstOrder) {
        const firstTimeDiscount = orderValue * 0.1;
        appliedDiscounts.push({
          type: 'first-time',
          amount: firstTimeDiscount,
          description: 'Welcome! First-time customer discount',
        });
      }

      // Promo code validation with business rules
      if (promoCode != null && promoCode.trim() !== '') {
        const promoDiscount = await this.validateAndApplyPromoCode(promoCode, orderValue);
        if (promoDiscount.isSuccess) {
          appliedDiscounts.push({
            type: 'promo',
            amount: promoDiscount.getValue,
            code: promoCode,
            description: `Promo code discount: ${promoCode}`,
          });
        }
      }

      const totalDiscount = appliedDiscounts.reduce((sum, discount) => sum + discount.amount, 0);

      return ResultSpecification.ok({
        totalDiscount,
        appliedDiscounts,
      });
    } catch (error) {
      this.logger.error('Failed to calculate discounts:', error);
      return ResultSpecification.fail({
        errorKey: 'DISCOUNT_CALCULATION_ERROR',
        errorParam: { error: String(error) },
      });
    }
  }

  validatePricingIntegrity(
    originalPrice: number,
    calculatedPrice: number,
    discounts: DiscountResult,
  ): ResultSpecification<boolean> {
    // Complex business rules for pricing integrity
    const minimumPrice = originalPrice * 0.1;
    const finalPrice = calculatedPrice - discounts.totalDiscount;

    if (finalPrice < minimumPrice) {
      return ResultSpecification.fail({
        errorKey: 'PRICING_INTEGRITY_VIOLATION',
        errorParam: {
          finalPrice,
          minimumPrice,
          reason: 'Price too low after discounts',
        },
      });
    }

    const maxDiscount = originalPrice * 0.8;
    if (discounts.totalDiscount > maxDiscount) {
      return ResultSpecification.fail({
        errorKey: 'DISCOUNT_LIMIT_EXCEEDED',
        errorParam: {
          totalDiscount: discounts.totalDiscount,
          maxDiscount,
          reason: 'Total discount exceeds maximum allowed',
        },
      });
    }

    return ResultSpecification.ok(true);
  }

  private calculateUserTier(user: UserAggregate): 'bronze' | 'silver' | 'gold' | 'platinum' {
    // Complex tier calculation considering multiple factors
    const accountAgeMonths = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const lastActivity = (Date.now() - user.updatedAt.getTime()) / (1000 * 60 * 60 * 24);

    // Business rules: combine age and activity for tier determination
    if (accountAgeMonths >= 24 && lastActivity <= 30) return 'platinum';
    if (accountAgeMonths >= 12 && lastActivity <= 60) return 'gold';
    if (accountAgeMonths >= 6 && lastActivity <= 90) return 'silver';
    return 'bronze';
  }

  private getTierPriceAdjustment(tier: string, total: number): PricingResult['priceAdjustments'][0] {
    const discountRates = { bronze: 0, silver: 0.02, gold: 0.05, platinum: 0.1 };
    const rate = discountRates[tier as keyof typeof discountRates] || 0;

    return {
      reason: `${tier} tier member discount`,
      type: 'decrease',
      amount: total * rate,
      percentage: rate * 100,
    };
  }

  private calculateDemandAdjustment(demand: number, items: OrderItemEntity[]): PricingResult['priceAdjustments'][0] {
    // Complex demand-based pricing
    const adjustment = (demand - 1.0) * 0.1;
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      reason: `Market demand adjustment (${demand}x)`,
      type: adjustment >= 0 ? 'increase' : 'decrease',
      amount: Math.abs(total * adjustment),
      percentage: Math.abs(adjustment * 100),
    };
  }

  private calculateSeasonalAdjustment(
    seasonality: number,
    items: OrderItemEntity[],
  ): PricingResult['priceAdjustments'][0] {
    const adjustment = (seasonality - 1.0) * 0.05;
    const total = items.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
      reason: `Seasonal pricing adjustment`,
      type: adjustment >= 0 ? 'increase' : 'decrease',
      amount: Math.abs(total * adjustment),
      percentage: Math.abs(adjustment * 100),
    };
  }

  private calculateVolumeAdjustment(items: OrderItemEntity[]): PricingResult['priceAdjustments'][0] {
    // Complex volume discount rules
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => sum + item.totalPrice, 0);

    let discount = 0;
    if (totalQuantity >= 100) discount = 0.15;
    else if (totalQuantity >= 50) discount = 0.1;
    else if (totalQuantity >= 20) discount = 0.05;

    return {
      reason: `Volume discount for ${totalQuantity} items`,
      type: 'decrease',
      amount: totalValue * discount,
      percentage: discount * 100,
    };
  }

  private calculateLoyaltyDiscount(user: UserAggregate): number {
    const tier = this.calculateUserTier(user);
    const baseDiscount = { bronze: 0, silver: 50, gold: 100, platinum: 200 };
    return baseDiscount[tier] || 0;
  }

  private calculateVolumeDiscount(orderValue: number): number {
    // Progressive volume discount rules
    if (orderValue >= 1000) return orderValue * 0.1;
    if (orderValue >= 500) return orderValue * 0.05;
    if (orderValue >= 200) return orderValue * 0.02;
    return 0;
  }

  private calculateSeasonalDiscount(date: Date, orderValue: number): number {
    const month = date.getMonth() + 1;
    const isHolidaySeason = month === 12 || month === 1 || month === 7;
    return isHolidaySeason ? orderValue * 0.05 : 0;
  }

  private isFirstTimeCustomer(user: UserAggregate): Promise<boolean> {
    // Complex first-time customer detection
    const daysSinceCreation = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Promise.resolve(daysSinceCreation <= 7);
  }

  private validateAndApplyPromoCode(code: string, orderValue: number): Promise<ResultSpecification<number>> {
    // Complex promo code validation with business rules
    const validPromoCodes = {
      WELCOME10: { discount: 0.1, minOrder: 50, maxUses: 1000 },
      SAVE20: { discount: 0.2, minOrder: 100, maxUses: 500 },
      BIGDEAL: { discount: 0.25, minOrder: 200, maxUses: 100 },
    };

    const promo = validPromoCodes[code as keyof typeof validPromoCodes];
    if (promo == null) {
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'INVALID_PROMO_CODE',
          errorParam: { code },
        }),
      );
    }

    if (orderValue < promo.minOrder) {
      return Promise.resolve(
        ResultSpecification.fail({
          errorKey: 'PROMO_MIN_ORDER_NOT_MET',
          errorParam: { code, required: promo.minOrder, current: orderValue },
        }),
      );
    }

    return Promise.resolve(ResultSpecification.ok(orderValue * promo.discount));
  }
}
