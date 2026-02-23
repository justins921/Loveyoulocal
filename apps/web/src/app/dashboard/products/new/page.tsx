'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, ShoppingBag } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { slugify } from '@/lib/utils';
import type { Vendor } from '@ilovefdl/shared';
import { ExternalPlatform } from '@ilovefdl/shared';

export default function NewProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [inventory, setInventory] = useState('0');
  const [categoryTags, setCategoryTags] = useState('');
  const [images, setImages] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    async function findVendor() {
      try {
        const vendorsRes = await api.getVendors({ limit: 100 });
        const myVendor = vendorsRes.data.find((v) => v.userId === user!.id);
        if (myVendor) {
          setVendor(myVendor);
        }
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }

    findVendor();
  }, [user, authLoading, router]);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const parsedImages = images
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedTags = categoryTags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await api.createProduct({
        name,
        slug,
        description: description || undefined,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        inventory: parseInt(inventory, 10) || 0,
        images: parsedImages,
        categoryTags: parsedTags,
        isActive,
        externalPlatform: ExternalPlatform.NATIVE,
      });

      router.push('/dashboard/products');
    } catch (err: any) {
      setError(err?.message || 'Failed to create product.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center max-w-md">
          <ShoppingBag className="w-16 h-16 text-primary/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-primary mb-3">No Vendor Profile</h1>
          <p className="text-primary/60">You need a vendor profile to add products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-white border-b border-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-primary">Add New Product</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-light p-6 space-y-5">
            <h2 className="text-lg font-bold text-primary">Basic Information</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-1.5">
                Product Name *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Handmade Candle"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-primary mb-1.5">
                URL Slug *
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="handmade-candle"
                className="input-field"
                required
              />
              <p className="text-xs text-primary/40 mt-1">
                This will be used in the product URL. Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-primary mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                className="input-field resize-y"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl border border-light p-6 space-y-5">
            <h2 className="text-lg font-bold text-primary">Pricing & Inventory</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-primary mb-1.5">
                  Price ($) *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="compareAtPrice" className="block text-sm font-medium text-primary mb-1.5">
                  Compare-at Price ($)
                </label>
                <input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-field"
                />
                <p className="text-xs text-primary/40 mt-1">
                  Original price for showing a discount (optional).
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="inventory" className="block text-sm font-medium text-primary mb-1.5">
                Inventory Count
              </label>
              <input
                id="inventory"
                type="number"
                min="0"
                value={inventory}
                onChange={(e) => setInventory(e.target.value)}
                className="input-field w-32"
              />
            </div>
          </div>

          {/* Images & Tags */}
          <div className="bg-white rounded-xl border border-light p-6 space-y-5">
            <h2 className="text-lg font-bold text-primary">Images & Tags</h2>

            <div>
              <label htmlFor="images" className="block text-sm font-medium text-primary mb-1.5">
                Image URLs
              </label>
              <textarea
                id="images"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
                rows={3}
                className="input-field resize-y font-mono text-sm"
              />
              <p className="text-xs text-primary/40 mt-1">One URL per line.</p>
            </div>

            <div>
              <label htmlFor="categoryTags" className="block text-sm font-medium text-primary mb-1.5">
                Category Tags
              </label>
              <input
                id="categoryTags"
                type="text"
                value={categoryTags}
                onChange={(e) => setCategoryTags(e.target.value)}
                placeholder="candles, home decor, gifts"
                className="input-field"
              />
              <p className="text-xs text-primary/40 mt-1">Comma-separated tags.</p>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl border border-light p-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-teal focus:ring-teal"
              />
              <div>
                <span className="text-sm font-medium text-primary">Active</span>
                <p className="text-xs text-primary/50">
                  Active products are visible in the marketplace.
                </p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-accent text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/products"
              className="px-6 py-3 text-sm font-medium text-primary/70 hover:text-primary transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !name || !slug || !price}
              className="btn-primary py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
