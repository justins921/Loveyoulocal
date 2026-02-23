'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Bar } from '@ilovefdl/shared';

export default function EditBarPage() {
  const router = useRouter();
  const params = useParams();
  const barId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [photos, setPhotos] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.push('/auth');
      return;
    }

    async function fetchBar() {
      try {
        const res = await api.getBars({ limit: 100 });
        const found = res.data.find((b) => b.id === barId);
        if (found) {
          setBar(found);
          setName(found.name);
          setSlug(found.slug);
          setAddress(found.address);
          setDescription(found.description || '');
          setPhone(found.phone || '');
          setWebsite(found.website || '');
          setMapLink(found.mapLink || '');
          setPhotos(found.photos?.join('\n') || '');
        }
      } catch {
        // Failed
      } finally {
        setLoading(false);
      }
    }

    fetchBar();
  }, [user, authLoading, router, barId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const parsedPhotos = photos.split('\n').map((s) => s.trim()).filter(Boolean);

      await api.updateBar(barId, {
        name,
        slug,
        address,
        description: description || undefined,
        phone: phone || undefined,
        website: website || undefined,
        mapLink: mapLink || undefined,
        photos: parsedPhotos,
      });

      router.push('/admin/bars');
    } catch (err: any) {
      setError(err?.message || 'Failed to update bar.');
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

  if (!bar) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-3">Bar Not Found</h1>
          <Link href="/admin/bars" className="btn-primary">Back to Bars</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="bg-white border-b border-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/bars" className="inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Bars
          </Link>
          <h1 className="text-3xl font-bold text-primary">Edit Bar</h1>
          <p className="text-primary/60 mt-1">{bar.name}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-light p-6 space-y-5">
            <h2 className="text-lg font-bold text-primary">Bar Details</h2>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-primary mb-1.5">Bar Name *</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-primary mb-1.5">URL Slug *</label>
              <input id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="input-field" required />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-primary mb-1.5">Address *</label>
              <input id="address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="input-field" required />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-primary mb-1.5">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field resize-y" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-light p-6 space-y-5">
            <h2 className="text-lg font-bold text-primary">Contact & Links</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-primary mb-1.5">Phone</label>
                <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
              </div>
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-primary mb-1.5">Website</label>
                <input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className="input-field" />
              </div>
            </div>

            <div>
              <label htmlFor="mapLink" className="block text-sm font-medium text-primary mb-1.5">Google Maps Link</label>
              <input id="mapLink" type="url" value={mapLink} onChange={(e) => setMapLink(e.target.value)} className="input-field" />
            </div>

            <div>
              <label htmlFor="photos" className="block text-sm font-medium text-primary mb-1.5">Photo URLs</label>
              <textarea id="photos" value={photos} onChange={(e) => setPhotos(e.target.value)} rows={3} className="input-field resize-y font-mono text-sm" />
              <p className="text-xs text-primary/40 mt-1">One URL per line.</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-accent text-sm">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/bars" className="px-6 py-3 text-sm font-medium text-primary/70 hover:text-primary transition-colors">Cancel</Link>
            <button type="submit" disabled={saving || !name || !slug || !address} className="btn-primary py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
