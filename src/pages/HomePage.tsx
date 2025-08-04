import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PostCard } from '@/components/posts/PostCard';
import { Search, RefreshCw } from 'lucide-react';
import { Post, User, Comment } from '@/types';
import { postsAPI } from '@/lib/api';

interface HomePageProps {
  user: User;
  selectedTag?: string;
  onTagSelect?: (tag: string) => void;
  onEditPost?: (post: Post) => void;
  onDeletePost?: (postId: number) => void;
  onFollowToggle?: () => void;
}

export function HomePage({
  user,
  selectedTag,
  onTagSelect,
  onEditPost,
  onDeletePost,
  onFollowToggle
}: HomePageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {};
      if (selectedTag) {
        params.tag = selectedTag;
      }
      
      const { posts } = await postsAPI.getPosts(params);
      setPosts(posts || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка загрузки постов');
      console.error('Error fetching posts:', err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedTag]);

  const handleCommentAdded = (postId: number, comment: Comment) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              comments_count: post.comments_count + 1,
              comments: [...(post.comments || []), comment]
            }
          : post
      )
    );
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    return post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
           post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'most_commented':
        return b.comments_count - a.comments_count;
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h1 className="font-bold mb-4">
          {selectedTag ? `#${selectedTag}` : 'Главная лента'}
        </h1>
        
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск постов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="newest">Новые</option>
            <option value="oldest">Старые</option>
            <option value="most_commented">Популярные</option>
          </select>
          
          <Button
            variant="outline"
            onClick={fetchPosts}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка постов...</p>
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? 'Посты не найдены' : 'Нет постов для отображения'}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              onEdit={onEditPost}
              onDelete={onDeletePost}
              onTagClick={onTagSelect}
              onCommentAdded={handleCommentAdded}
              onFollowToggle={onFollowToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
} 