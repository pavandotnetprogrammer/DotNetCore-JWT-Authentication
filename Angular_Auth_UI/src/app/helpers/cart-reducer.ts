import { createReducer, on } from "@ngrx/store";
import { IProduct } from "../shared/models/product.interface";
import { addToCart, decrementProduct, incrementProduct, removeItem } from "./cart-action";
import { state } from "@angular/animations";

export interface CartState {
    products: IProduct[];
    totalPrice?:number;
}

export const initialCounterState: CartState = {
    products: []
}
export const cartReducer = createReducer(
    initialCounterState,
    on(addToCart, (state, { product }) => {
        const updatedProduct = [...state.products, product];
        return {
            ...state,
            products: updatedProduct,
        }
    }),
    on(removeItem, (state, { productId }) => {
        const udpatedProduct = state.products.filter((product)=>product.id!==productId);
        return {
            ...state,
            products:udpatedProduct
        }
    }),
    on(incrementProduct, (state, { productId }) => {
        const udpatedProduct = state.products.map((product) => product.id === productId ? {...product,quantity:product.quantity+1} : product)
        return {
            ...state,
            products:udpatedProduct
        }
    }),
    on(decrementProduct, (state, { productId }) => {
        const udpatedProduct = state.products.map((product) => product.id === productId ? {...product,quantity:product.quantity-1} : product)
        return {
            ...state,
            products:udpatedProduct
        }
    })


);