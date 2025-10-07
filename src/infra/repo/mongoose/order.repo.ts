import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { type IOrderRepository, OrderAggregate, OrderStatus } from '@module/order/domain';
import { ProductName } from '@module/order/domain/vo';
import { OrderItemEntity } from '@module/order/domain/entity';
import { IdVO } from '@shared/domain/vo';
import { ResultSpecification } from '@shared/domain/specification';
import { TRANSLATOR_KEY } from '@shared/translator';

@Schema()
export class OrderItemDocument {
  @Prop({ required: true })
  id!: string;

  @Prop({ required: true })
  productId!: string;

  @Prop({ required: true })
  productName!: string;

  @Prop({ required: true })
  quantity!: number;

  @Prop({ required: true })
  unitPrice!: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItemDocument);

@Schema({ collection: 'orders' })
export class OrderDocument extends Document {
  declare _id: string;

  @Prop({ required: true })
  customerId!: string;

  @Prop({ required: true, enum: OrderStatus })
  status!: OrderStatus;

  @Prop({ type: [OrderItemSchema], required: true })
  items!: OrderItemDocument[];

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDocument);

@Injectable()
export class OrderMongooseRepository implements IOrderRepository {
  constructor(
    @InjectModel(OrderDocument.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async save(orderAggregate: OrderAggregate): Promise<ResultSpecification<OrderAggregate>> {
    try {
      // Check if this is a new order (placeholder ID) or existing order
      if (orderAggregate.id.isPlaceholder()) {
        // New order - let MongoDB generate ID
        const orderDoc = {
          customerId: orderAggregate.customerId.value,
          status: orderAggregate.status,
          items: orderAggregate.items.map((item) => ({
            productId: item.productId.value, // Extract string from IdVO
            productName: item.productName.value,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
          createdAt: orderAggregate.createdAt,
          updatedAt: orderAggregate.updatedAt,
        };

        const newDoc = await this.orderModel.create(orderDoc);
        return ResultSpecification.ok(this.toDomain(newDoc));
      } else {
        // Existing order - update
        const updatedDoc = await this.orderModel.findByIdAndUpdate(
          orderAggregate.id.value,
          {
            status: orderAggregate.status,
            items: orderAggregate.items.map((item) => ({
              productId: item.productId.value, // Extract string from IdVO
              productName: item.productName.value,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
            updatedAt: new Date(),
          },
          { new: true },
        );

        if (!updatedDoc) {
          return ResultSpecification.fail({
            errorKey: TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND,
          });
        }

        return ResultSpecification.ok(this.toDomain(updatedDoc));
      }
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__CREATION_FAILED,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async findById(id: IdVO): Promise<ResultSpecification<OrderAggregate | null>> {
    try {
      const orderDoc = await this.orderModel.findById(id);

      if (!orderDoc) {
        return ResultSpecification.ok(null);
      }

      return ResultSpecification.ok(this.toDomain(orderDoc));
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async findByCustomerId(customerId: IdVO): Promise<ResultSpecification<OrderAggregate[]>> {
    try {
      const orderDocs = await this.orderModel.find({ customerId });
      const orders = orderDocs.map((doc) => this.toDomain(doc));
      return ResultSpecification.ok(orders);
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  async delete(id: IdVO): Promise<ResultSpecification<void>> {
    try {
      await this.orderModel.findByIdAndDelete(id);
      return ResultSpecification.ok(undefined);
    } catch (error) {
      return ResultSpecification.fail({
        errorKey: TRANSLATOR_KEY.ERROR__ORDER__NOT_FOUND,
        errorParam: { reason: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private toDomain(orderDoc: OrderDocument): OrderAggregate {
    const orderId = IdVO.fromValue(orderDoc._id.toString());
    const customerId = IdVO.fromValue(orderDoc.customerId);

    const items = orderDoc.items.map((itemDoc) => {
      return new OrderItemEntity({
        productId: IdVO.fromValue(itemDoc.productId), // Convert string to IdVO
        productName: ProductName.fromValue(itemDoc.productName),
        quantity: itemDoc.quantity,
        unitPrice: itemDoc.unitPrice,
        id: IdVO.fromValue(itemDoc.id),
      });
    });

    const order = OrderAggregate.fromValue({
      id: orderId,
      customerId,

      status: orderDoc.status,
      items: items,

      createdAt: orderDoc.createdAt,
      updatedAt: orderDoc.updatedAt,
    });

    return order;
  }
}
