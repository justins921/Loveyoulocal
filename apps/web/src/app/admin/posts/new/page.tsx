'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { slugify } from '@/lib/utils';
import { PostCategory, PostStatus } from '@ilovefdl/shared';

const CATEGORIES = Object.values(PostCategory);
const STATUSES = Object.values(PostStatus);

const categoryLabels: Record<string, string> = {
  THE_FONDY_FRONTLINE: 'The Fondy Frontline',
  FACES_OF_OUR_FUTURE: 'Faces of our Future',
  FINDING_BALANCE: 'Finding Balance',
  PLAY_EXPLORE_REPEAT: 'Play. Explore. Repeat.',
  HOMEGROWN_HEROS: 'Homegrown Heros',
  THE_CREATIVE_CORNER: 'The Creative Corner',
  WEEKLY_SAVINGS: 'Weekly Savings',
  UNCATEGORIZED: 'Uncategorized',
};

export default function NewPostPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<PostCategory>(PostCategory.UNCATEGORIZED);
  const [status, setStatus] = useState<PostStatus>(PostStatus.DRAFT);
  const [tags, setTags] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== 'ADMIN' && user.role !== 'EDITOR')) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(slugify(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const parsedTags = tags.split(',').map((s) => s.trim()).filter(Boolean);

      await api.createPost({
        title,
        slug,
        content,
        excerpt: excerpt || undefined,
        category,
        status,
        tags: parsedTags,
        featuredImage: featuredImage || undefined,
      });

      router.push('/admin/posts');
    } catch (err: any) {
      setError(err?.message || 'Failed to create post.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      <div className="bg-white border-b border-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/admin/posts" className="inline-flex items-center gap-1 text-sm text-primary/60 hover:text-primary mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Posts
          </Link>
          <h1 className="text-3xl font-bold text-primary">New Blog Post</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-light p-6 space-y-5">
            <h2 className="text-lg font-bold text-primary">Post Details</h2>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-primary mb-1.5">Title *</label>
              <input id="title" type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} className="input-field" required />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-primary mb-1.5">URL Slug *</label>
              <input id="slug" type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="input-field" required />
            </div>

            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-primary mb-1.5">Excerpt</label>
              <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className="input-field resize-y" placeholder="Brief summary of the post..." />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-primary mb-1.5">Content *</label>
              <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="input-field resize-y font-mono text-sm" required placeholder="Write your post content here..." />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-light p-6 space-y-5">
            <h2 className="text-lg font-bold text-primary">Settings</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-primary mb-1.5">Category</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value as PostCategory)} className="input-field">
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{categoryLabels[cat] || cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-primary mb-1.5">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as PostStatus)} className="input-field">
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-primary mb-1.5">Tags</label>
              <input id="tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="input-field" placeholder="community, events, food" />
              <p className="text-xs text-primary/40 mt-1">Comma-separated.</p>
            </div>

            <div>
              <label htmlFor="featuredImage" className="block text-sm font-medium text-primary mb-1.5">Featured Image URL</label>
              <input id="featuredImage" type="url" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} className="input-field" placeholder="https://example.com/image.jpg" />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl text-accent text-sm">{error}</div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link href="/admin/posts" className="px-6 py-3 text-sm font-medium text-primary/70 hover:text-primary transition-colors">Cancel</Link>
            <button type="submit" disabled={saving || !title || !slug || !content} className="btn-primary py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Create Post</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
