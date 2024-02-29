import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProduct } from '../shared/models/product.interface';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {

  constructor(private http: HttpClient) { }

  getProducts() {
    return this.http.get<IProduct[]>("https://fakestoreapi.com/products")
      .pipe(
        map(((products) => {
          return products.map((product) => {
            return { ...product, quantity: 1 }
          })
        }))
      );
  }
}
