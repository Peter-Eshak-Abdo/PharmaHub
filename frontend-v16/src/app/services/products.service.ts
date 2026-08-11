import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:8080/api/availability';

  constructor(private http: HttpClient) {}

  getAllProduct() {
    return this.http.get(this.apiUrl);
  }

  createNewProduct(product: any) {
    return this.http.post(this.apiUrl, product);
  }

  updateProduct(product: any) {
    return this.http.put(`${this.apiUrl}/${product.id}`, product);
  }

  deleteProduct(id: any) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}