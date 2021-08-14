import React, { useState, useEffect } from "react";
import { MdAddShoppingCart } from "react-icons/md";

import { ProductList } from "./styles";
import { api } from "../../services/api";
import { formatPrice } from "../../util/format";
import { useCart } from "../../hooks/useCart";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<ProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    // const array1 = [1, 2, 3, 4];
    // const reducer = (accumulator, currentValue) => accumulator + currentValue;
    // 1 + 2 + 3 + 4
    // console.log(array1.reduce(reducer));
    // expected output: 10

    return (sumAmount = { ...sumAmount, [product.id]: product.amount });
  }, {} as CartItemsAmount);

  useEffect(() => {
    async function loadProducts() {
      await api.get("/products").then((response) => {
        const formattedProducts = response.data.map((item: Product) => ({
          ...item,
          priceFormatted: formatPrice(item.price),
        }));

        setProducts(formattedProducts);
      });
      // const response = await api.get("products");
      // setProducts(response.data);
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    // TODO
    // const storageList = localStorage.getItem("@RocketShoes:cart");
    //
    //JSON.parse > analisa uma string JSON, construindo o valor ou um objeto JavaScript descrito pela string
    // const productSaved = storageList ? JSON.parse(storageList) : [];

    // productSaved.push(id);
    // localStorage.setItem("@RocketShoes:cart", JSON.stringify(productSaved));
    // localStorage.setItem("@RocketShoes:cart", JSON.stringify(cart));
    addProduct(id);
  }

  return (
    <ProductList>
      {products.map((product) => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(product.price)}
          </span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
