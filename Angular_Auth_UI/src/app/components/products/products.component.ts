import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IProduct } from '../../shared/models/product.interface';
import { ProductApiService } from '../../services/product-api.service';
import { Store } from '@ngrx/store';
import { addToCart } from '../../helpers/cart-action';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {

  products:any=[];

  // constructor(private http:HttpClient,private productAPI:ProductApiService, private store:Store<{cart:{products:IProduct[]}}>){}
  constructor(private http:HttpClient,private productAPI:ProductApiService){}

  ngOnInit(): void {

    //this.products=this.http.get("https://fakestoreapi.com/products") as Observable<IProduct[]>;
    this.products=this.productAPI.getProducts() as Observable<IProduct[]>;
    
  }
  addItemToCart(product:IProduct){
    //this.store.dispatch(addToCart({product}));

  }

}
