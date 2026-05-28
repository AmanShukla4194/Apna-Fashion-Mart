'use client';

import CartDrawer from './CartDrawer';
import { useCart } from '@/contexts/CartContext';

export default function CartDrawerGlobal() {
  const { items, open, closeCart, setItems } = useCart();
  return (
    <CartDrawer
      open={open}
      onClose={closeCart}
      items={items}
      setItems={setItems}
    />
  );
}
