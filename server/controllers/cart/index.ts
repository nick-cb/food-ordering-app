import { NextFunction, Request, Response } from "express";
import { Model } from "sequelize";
import { jwtValidate } from "../../middlewares/auths";
import { sequelize } from "../../db/config";
import Cart from "../../models/cart";
import CartDetail from "../../models/cart/detail";
import { CartCreation, CartModel, createdCartPayload } from "../../types/cart";
import { getAttributes } from "../../utils/modelUtils";
import {
  controller,
  routeConfig,
  routeDescription,
} from "../../utils/routeConfig";
import { isArray, isNotNull } from "../../utils/validations/assertions";
import { requireValues } from "../../utils/validations/modelValidation";
import Product from "../../models/product";
import { cartValidate } from "../../middlewares/carts";
import { upsert } from "../../services";
import { increaseQuantity } from "./cart";

interface createPayloadType {
  product_id: number;
  quantity: number;
}

const path = "/carts";
@controller
class CartController {
  @routeDescription({
    request_payload: [getAttributes(CartDetail, ["product_id", "quantity"])],
    response_payload: createdCartPayload,
    isAuth: true,
    usage:
      "Create a single cart, shouldn't be used directly, use addToCart instead",
  })
  @routeConfig({
    method: "post",
    path: `${path}/create/single`,
    middlewares: [jwtValidate],
  })
  async createCart(req: Request, res: Response, __: NextFunction) {
    const { items } = req.body;
    const { user } = req;
    requireValues(items);
    isArray<Array<createPayloadType>>(items);
    isNotNull(user);
    const cart = await Cart.create<
      Model<CartCreation, CartModel | CartCreation | { cart_details: any }>
    >(
      { user_id: user.getDataValue("id") },
      {
        include: [
          {
            model: CartDetail,
            as: "cart_details",
            attributes: { exclude: ["cart_id"] },
          },
        ],
      }
    );

    res.json({ data: cart, success: true });
  }

  @routeDescription({
    request_payload: [getAttributes(CartDetail, ["product_id", "quantity"])],
  })
  @routeConfig({
    method: "post",
    path: `${path}/items/add`,
    middlewares: [jwtValidate, cartValidate],
  })
  async addProductsToCart(req: Request, res: Response, __: NextFunction) {
    const { items } = req.body;
    const { user } = req;
    const { cart } = req;
    requireValues(items);
    isArray<Array<createPayloadType>>(items);
    isNotNull(user);

    const failedInsert = [];
    const succeededInsert = [];
    for (const item of items) {
      const transaction = await sequelize.transaction();
      try {
        const product = await Product.findByPk(item.product_id, {
          transaction,
        });
        const [detail] = await upsert(CartDetail, {
          condition: {
            cart_id: cart.getDataValue("id"),
            product_id: item.product_id,
          },
          transaction,
        });
        const response = await increaseQuantity(
          detail,
          item.quantity,
          product?.getDataValue("stock") || 0,
          transaction
        );
        succeededInsert.push(response);
        transaction.commit();
      } catch (error: any) {
        // rollback if new updated quantity > stock
        failedInsert.push({ item, error: JSON.parse(error.message) });
        transaction.rollback();
      }
    }
    if (failedInsert.length > 0) {
      return res.json({
        message: "The operation succeed with error",
        data: { ...cart.get(), succeededInsert, failedInsert },
        success: true,
      });
    } else {
      return res.json({
        data: { ...cart.get(), succeededInsert },
        success: true,
      });
    }
  }
}

export default CartController;
