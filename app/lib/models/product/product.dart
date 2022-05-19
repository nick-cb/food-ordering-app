import 'package:app/models/product/Images.dart';
import 'dart:convert';
import 'package:app/utils/api_service.dart';

GetSingleProductResponse productFromJson(String str) =>
    GetSingleProductResponse.fromJson(json.decode(str));

class GetSingleProductResponse {
  String id,price;
  String? name, description;
  List<Images> images;
  String originalPrice;
  int stock, orderCount;
  String createdAt, updatedAt;

  GetSingleProductResponse(
      this.id,
      this.name,
      this.description,
      this.price,
      this.originalPrice,
      this.stock,
      this.orderCount,
      this.createdAt,
      this.updatedAt,
      this.images,
      );

  factory GetSingleProductResponse.fromJson(Map<dynamic, dynamic> json) => GetSingleProductResponse(
    json["id"],
    json["name"],
    json["description"],
    json["price"],
    json["original_price"],
    json["stock"],
    json["order_count"],
    json["created_at"],
    json["updated_at"],
    List<Images>.from(json["images"].map((x) => Images.fromJson(x))),
  );
}

class ProductItems {
  Future<GetSingleProductResponse> getSingleProduct(int id) async {
    var response = await ApiService().get("/api/products/product?id=$id");
    final Map parsed = json.decode(response.body);
    if (response.statusCode == 200) {
      var productResponse = GetSingleProductResponse.fromJson(parsed);
      return productResponse;}
    else {
      // If the server did not return a 200 OK response,
      // then throw an exception.
      throw Exception('Failed to load product');
    }
  }

}