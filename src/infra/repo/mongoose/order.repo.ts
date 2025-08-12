import { Injectable } from '@nestjs/common';
import { InjectModel, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { type IOrderRepository, OrderAggregate, OrderStatus } from '@module/order/domain';
import { OrderId, CustomerId, OrderIdItem, ProductId, ProductName } from '@module/order/domain/vo';
import { OrderItemEntity } from '@module/order/domain/entity';

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
      customerId: orderAggregate.props.customerId.value,
      status: orderAggregate.props.status,
      items: orderAggregate.props.items.map(item => ({
        id: item.props.id.value,
        productId: item.props.productId.value,
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

  async findById(id: OrderId): Promise<OrderAggregate | null> {
    const orderDoc = await this.orderModel.findById(id.value);

    if (!orderDoc) {
      return null;
    }

    return this.toDomain(orderDoc);
  }

  async findByCustomerId(customerId: CustomerId): Promise<OrderAggregate[]> {
    const orderDocs = await this.orderModel.find({ customerId: customerId.value });
    return orderDocs.map(doc => this.toDomain(doc));
  }

  async delete(id: OrderId): Promise<void> {
    await this.orderModel.findByIdAndDelete(id.value);
  }

  private toDomain(orderDoc: OrderDocument): OrderAggregate {
    const orderId = OrderId.fromValue(orderDoc._id.toString());
    const customerId = CustomerId.fromValue(orderDoc.customerId);

    const items = orderDoc.items.map(itemDoc => {
      return new OrderItemEntity({
        id: OrderIdItem.fromValue(itemDoc.id),
        productId: ProductId.fromValue(itemDoc.productId),
        productName: ProductName.fromValue(itemDoc.productName),
        quantity: itemDoc.quantity,
        unitPrice: itemDoc.unitPrice,
      });
    });

    const order = OrderAggregate.fromValue({
      id: orderId,
      customerId: customerId,
      status: orderDoc.status,
      items: items,
      createdAt: orderDoc.createdAt,
      updatedAt: orderDoc.updatedAt,
    });

    return order;
  }
}