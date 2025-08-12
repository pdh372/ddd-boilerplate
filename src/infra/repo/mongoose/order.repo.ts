import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { type IOrderRepository, OrderAggregate, OrderStatus } from '@module/order/domain';
import { ProductName } from '@module/order/domain/vo';
import { OrderItemEntity } from '@module/order/domain/entity';
import { IdVO } from '../../../shared/domain/vo';

@Schema()
export class OrderItemDocument {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  productName: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItemDocument);

@Schema({ collection: 'orders' })
export class OrderDocument extends Document {
  declare _id: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true, enum: OrderStatus })
  status: OrderStatus;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItemDocument[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderDocument);

@Injectable()
export class OrderMongooseRepository implements IOrderRepository {
  constructor(
    @InjectModel(OrderDocument.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async save(orderAggregate: OrderAggregate): Promise<OrderAggregate> {
    const orderDoc = {
      customerId: orderAggregate.props.customerId,
      status: orderAggregate.props.status,
      items: orderAggregate.props.items.map((item) => ({
        productId: item.props.productId,
        productName: item.props.productName.value,
        quantity: item.props.quantity,
        unitPrice: item.props.unitPrice,
      })),
      createdAt: orderAggregate.props.createdAt,
      updatedAt: orderAggregate.props.updatedAt,
    };

    const newDoc = await this.orderModel.create(orderDoc);
    return this.toDomain(newDoc);
  }

  async findById(id: IdVO): Promise<OrderAggregate | null> {
    const orderDoc = await this.orderModel.findById(id);

    if (!orderDoc) {
      return null;
    }

    return this.toDomain(orderDoc);
  }

  async findByCustomerId(customerId: IdVO): Promise<OrderAggregate[]> {
    const orderDocs = await this.orderModel.find({ customerId });
    return orderDocs.map((doc) => this.toDomain(doc));
  }

  async delete(id: IdVO): Promise<void> {
    await this.orderModel.findByIdAndDelete(id);
  }

  private toDomain(orderDoc: OrderDocument): OrderAggregate {
    const orderId = IdVO.fromValue(orderDoc._id.toString());
    const customerId = IdVO.fromValue(orderDoc.customerId);

    const items = orderDoc.items.map((itemDoc) => {
      return new OrderItemEntity({
        productId: itemDoc.productId,
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
