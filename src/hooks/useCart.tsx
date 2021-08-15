import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      //pegar todos os itens do carrinho
      const updatedCart = cart.map((product) => ({ ...product }));

      //verificar se o produto ja existe no carrinho
      const productAlreadyExist = updatedCart.find((item) => item.id === productId);

      //pegar item em estoque pelo id do produto
      const stock = await api.get(`/stock/${productId}`);

      //checar quantia no estoque
      const stockAmount = stock.data.amount;
      //console.log("stockAmount " + stockAmount);

      //checar quantidade item do mesmo produto no carrinho
      const currentAmount = productAlreadyExist ? productAlreadyExist.amount : 0;
      //console.log("currentAmount " + currentAmount);

      //Se nao existe item no carrinho, add +1
      const amount = currentAmount + 1;

      if (productAlreadyExist) {
        productAlreadyExist.amount = amount;
      } else {
        const product = await api.get(`/products/${productId}`);

        const newProduct = {
          ...product.data,
          amount: 1,
        };
        // console.log(newProduct);

        updatedCart.push(newProduct);
      }

      //checar quantidade em realação ao estoque
      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      setCart(updatedCart);
      localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
    } catch {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const updatedCart = cart.map((product) => ({ ...product }));

      const productIdx = updatedCart.findIndex(
        (product) => product.id === productId
      );

      if (productIdx >= 0) {
        updatedCart.splice(productIdx, 1);

        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na remoção do produto");
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) {
        return;
      }

      //pegar item em estoque pelo id do produto
      const stock = await api.get(`/stock/${productId}`);

      //checar quantia no estoque
      const stockAmount = stock.data.amount;

      if (amount > stockAmount) {
        toast.error("Quantidade solicitada fora de estoque");
        return;
      }

      const updatedCart = cart.map((product) => ({ ...product }));
      const productAlreadyExist = updatedCart.find((item) => item.id === productId);

      if (productAlreadyExist) {
        productAlreadyExist.amount = amount;
        setCart(updatedCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart));
      } else {
        throw Error();
      }
    } catch {
      toast.error("Erro na alteração de quantidade do produto");
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
