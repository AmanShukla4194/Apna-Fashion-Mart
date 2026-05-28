'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowRight, Minus, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AFM_DATA } from '@/lib/seed-data';
import { useCart } from '@/contexts/CartContext';

function AfmButton({ variant='primary', size, children, onClick, className='' }) {
  const cls = variant === 'on-dark'  ? 'afm-btn afm-btn-on-dark'
            : variant === 'ghost'    ? 'afm-btn afm-btn-ghost'
            : variant === 'light'    ? 'afm-btn afm-btn-light'
            : 'afm-btn afm-btn-primary';
  return <button className={`${cls}${size === 'sm' ? ' afm-btn-sm' : ''}${className ? ' ' + className : ''}`} onClick={onClick}>{children}</button>;
}



function CartDrawer({ open, onClose, items, setItems }) {
  const router = useRouter();
  const { updateQty: ctxUpdateQty, removeFromCart } = useCart();

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const delivery = subtotal > 999 ? 0 : 40;
  const total = subtotal + delivery;

  const updateQty = (id, size, delta) => ctxUpdateQty(id, size, delta);
  const removeItem = (id, size) => removeFromCart(id, size);

  return (
    <>
      <div className={`cart-scrim ${open ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`cart-drawer ${open ? 'open' : ''}`}>
        <div className="cart-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h3>Your Bag</h3>
            <span className="count">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>
          <button className="cart-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <img src="/brand-icons/hanger-glyph.svg" alt="Empty"/>
              <h4>Your bag is empty</h4>
              <p>Discover boutiques near you in Bandra</p>
              <AfmButton variant="primary" onClick={() => { onClose(); router.push('/nearby-shops'); }}>Explore nearby</AfmButton>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id + item.size} className="cart-row">
                <div className="thumb" style={{ background: item.bg, backgroundImage: item.img ? `url(${item.img})` : item.bg, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div className="info">
                  <div className="store">by {item.store}</div>
                  <div className="name">{item.name}</div>
                  <div className="variants">Size {item.size} · <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 99, background: item.color, verticalAlign: '-1px', marginRight: 4 }}></span> · 1.4 km · Free delivery</div>
                  <div className="price-line">
                    <div className="cart-qty">
                      <button onClick={() => updateQty(item.id, item.size, -1)}><Minus size={14}/></button>
                      <span className="v">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.size, 1)}><Plus size={14}/></button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="price">₹{(item.price * item.qty).toLocaleString('en-IN')}</span>
                      <button onClick={() => removeItem(item.id, item.size)} style={{ background: 'transparent', border: 0, color: 'var(--neutral-400)', cursor: 'pointer' }} aria-label="Remove"><Trash2 size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="row">
              <span className="l">Subtotal</span>
              <span className="v">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="row">
              <span className="l">Local delivery</span>
              <span className="v">{delivery === 0 ? 'Free' : '₹' + delivery}</span>
            </div>
            <div className="row total" style={{ paddingTop: 10, borderTop: '1px solid var(--afm-border)', marginTop: 10 }}>
              <span className="l">Total</span>
              <span className="v">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <AfmButton variant="primary" onClick={() => { onClose(); router.push('/checkout'); }}>
                Proceed to checkout · <ArrowRight size={16}/>
              </AfmButton>
            </div>
            {delivery > 0 && (
              <div className="free-msg">Add ₹{(999 - subtotal).toLocaleString('en-IN')} more for free delivery</div>
            )}
            {delivery === 0 && <div className="free-msg">🎁 You unlocked free local delivery</div>}
          </div>
        )}
      </aside>
    </>
  );
}


export default CartDrawer;
