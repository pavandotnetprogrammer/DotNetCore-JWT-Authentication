import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IProduct } from '../../models/product.interface';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent implements OnInit {

  @Input() product!:IProduct;
  @Output() handleAdd=new EventEmitter();

  constructor(){}
  ngOnInit(): void {
    
  }
  addToCart(product:IProduct){
    this.handleAdd.emit(product);

  }

}
