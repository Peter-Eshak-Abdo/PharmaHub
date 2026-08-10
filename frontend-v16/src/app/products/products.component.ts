import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  product: any[] = [];

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.getAllProduct();
  }

  getAllProduct() {
    this.productsService.getAllProduct().subscribe((data: any) => {
      this.product = data;
    });
  }
}