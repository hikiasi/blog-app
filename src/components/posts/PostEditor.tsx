import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { Post } from '@/types';
import { postsAPI } from '@/lib/api';

interface PostEditorProps {
  post?: Post | null;
  onSave: () => void;
  onCancel: () => void;
}

export function PostEditor({ post, onSave, onCancel }: PostEditorProps) {
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    tags: post?.tags || [],
    visibility: post?.is_public 
      ? (post?.is_request_only ? 'request_only' : 'public') 
      : 'private'
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (post) {
        // Редактирование существующего поста
        await postsAPI.updatePost(post.id, formData);
      } else {
        // Создание нового поста
        await postsAPI.createPost(formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка сохранения поста');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{post ? 'Редактировать пост' : 'Новый пост'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Заголовок</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Введите заголовок поста"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Содержание</label>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Напишите содержание поста..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Теги</label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Добавить тег"
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Видимость</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="public">Публичный</option>
              <option value="private">Приватный</option>
              <option value="request_only">Только по запросу</option>
            </select>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 