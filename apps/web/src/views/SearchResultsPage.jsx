'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowUpDown, Search, ShoppingBag, Star, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { apiRequest } from '@/lib/aws/config';
import { useCart } from '@/contexts/CartContext';

const PAGE_SIZE = 20;

const SORT_LABELS = {
  newest:     'Newest',
  price_asc:  'Price: Low to High',
  price_desc: 'Price: High to Low',
  rating:     'Top Rated',
};

function getImage(product) {
  if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
  if (typeof product.images === 'string') {
    try { const arr = JSON.parse(product.images); if (arr.length > 0) return arr[0]; } catch {}
  }
  return null;
}

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const urlQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQ);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);

  const fetchProducts = useCallback(async (q, sortMode, pageNum) => {
    if (!q.trim()) { setProducts([]); setTotal(0); return; }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        search: q,
        limit: String(PAGE_SIZE),
        offset: String(pageNum * PAGE_SIZE),
      });
      if (sortMode !== 'newest') params.set('sortBy', sortMode);
      const data = await apiRequest(`/products?${params}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch {
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setQuery(urlQ);
    setPage(0);
    fetchProducts(urlQ, sort, 0);
  }, [urlQ]);

  useEffect(() => {
    fetchProducts(query, sort, page);
  }, [sort, page]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push('/search?q=' + encodeURIComponent(query.trim()));
    }
  };

  const nav = (v) => {
    const m = { home: '/', nearby: '/nearby-shops', cart: '/cart', account: '/account', wishlist: '/wishlist' };
    router.push(m[v] ?? '/');
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <Header setView={nav} />
      <main style={{ minHeight: '100vh', background: 'var(--neutral-50, #f8f9fb)', paddingBottom: 60 }}>

        {/* Search hero */}
        <div style={{ background: 'var(--navy-800, #001f3f)', padding: '32px 0 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search sarees, kurtas, lehengas…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '14px 48px', borderRadius: 12, border: 'none',
                  font: '500 16px Poppins', color: 'var(--navy-800)', outline: 'none',
                }}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setProducts([]); setTotal(0); router.push('/search'); }}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

          {/* Sort + count bar */}
          {urlQ && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--afm-border, #e2e8f0)' }}>
              <span style={{ font: '400 14px Poppins', color: 'var(--neutral-500, #6b7280)' }}>
                {loading ? 'Searching…' : (
                  <>{total.toLocaleString()} result{total !== 1 ? 's' : ''} for <strong style={{ color: 'var(--navy-800)' }}>"{urlQ}"</strong></>
                )}
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <ArrowUpDown size={14} style={{ color: 'var(--neutral-500)' }} />
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(0); }}
                  style={{ font: '500 13px Poppins', color: 'var(--navy-800)', border: '1px solid var(--afm-border, #e2e8f0)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', outline: 'none', background: '#fff' }}>
                  {Object.entries(SORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#ef4444', font: '400 15px Poppins' }}>{error}</div>
          )}

          {/* No query */}
          {!urlQ && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <Search size={48} style={{ color: 'var(--neutral-300, #cbd5e1)', marginBottom: 16 }} />
              <div style={{ font: '600 20px Playfair Display', color: 'var(--navy-800)', marginBottom: 8 }}>Search for products</div>
              <p style={{ font: '400 14px Poppins', color: 'var(--neutral-500)' }}>Type in the search bar above and press Enter</p>
            </div>
          )}

          {/* No results */}
          {!loading && !error && urlQ && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ font: '600 20px Playfair Display', color: 'var(--navy-800)', marginBottom: 8 }}>No results found</div>
              <p style={{ font: '400 14px Poppins', color: 'var(--neutral-500)', margin: '0 0 24px' }}>
                Try searching for "saree", "kurta", or "lehenga"
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="product-grid" style={{ padding: '24px 0' }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ background: 'var(--neutral-100, #f1f3f6)', height: 240 }} />
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ background: 'var(--neutral-100)', height: 12, borderRadius: 6, marginBottom: 8 }} />
                    <div style={{ background: 'var(--neutral-100)', height: 10, borderRadius: 6, width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results grid */}
          {!loading && products.length > 0 && (
            <>
              <div className="product-grid" style={{ padding: '24px 0' }}>
                {products.map(product => {
                  const img = getImage(product);
                  const comparePrice = Number(product.compare_price || 0);
                  const price = Number(product.price || 0);
                  const hasDiscount = comparePrice > price;
                  const disc = hasDiscount ? Math.round((1 - price / comparePrice) * 100) : 0;
                  return (
                    <article key={product.id} className="product-card" style={{ cursor: 'pointer' }} onClick={() => router.push('/product/' + product.id)}>
                      <div className="img" style={{
                        backgroundImage: img ? `url(${img})` : 'var(--gradient-aurora)',
                        backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative',
                      }}>
                        <div className="badges">
                          {disc > 0 && <span className="b b-sale">-{disc}%</span>}
                        </div>
                        <button className="quick-add" onClick={e => { e.stopPropagation(); addToCart(product, 'M', ''); }}>
                          <ShoppingBag size={14} /> Quick add
                        </button>
                      </div>
                      <div className="body">
                        <div className="store">by {product.shop_name || 'Shop'}</div>
                        <div className="name">{product.name}</div>
                        <div className="price-row">
                          <div>
                            {hasDiscount && <div className="price-old">₹{comparePrice.toLocaleString('en-IN')}</div>}
                            <div className="price">₹{price.toLocaleString('en-IN')}</div>
                          </div>
                          {product.rating != null && (
                            <span className="rate"><span className="star"><Star size={11} /></span>{Number(product.rating).toFixed(1)}</span>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="cat-pagination">
                  <span className={`p ${page === 0 ? 'disabled' : ''}`} style={{ cursor: page > 0 ? 'pointer' : 'default' }}
                    onClick={() => page > 0 && setPage(p => p - 1)}>‹</span>
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                    <span key={i} className={`p ${page === i ? 'on' : ''}`} style={{ cursor: 'pointer' }} onClick={() => setPage(i)}>{i + 1}</span>
                  ))}
                  {totalPages > 5 && <span className="p range">…</span>}
                  {totalPages > 5 && <span className="p" style={{ cursor: 'pointer' }} onClick={() => setPage(totalPages - 1)}>{totalPages}</span>}
                  <span className={`p ${page === totalPages - 1 ? 'disabled' : ''}`} style={{ cursor: page < totalPages - 1 ? 'pointer' : 'default' }}
                    onClick={() => page < totalPages - 1 && setPage(p => p + 1)}>›</span>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function SearchResultsPage() {
  return (
    <React.Suspense fallback={<div style={{ minHeight: '100vh' }} />}>
      <SearchResults />
    </React.Suspense>
  );
}
