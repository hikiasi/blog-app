import { useState, useEffect } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { Navigation } from '@/components/layout/Navigation';
import { PostEditor } from '@/components/posts/PostEditor';
import { HomePage } from '@/pages/HomePage';
import { FollowingPage } from '@/pages/FollowingPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { User, Post, Tag, Comment } from '@/types';
import { postsAPI, tagsAPI } from '@/lib/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd verify the token with the server
      // For now, we'll just check if it exists
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setUser(user);
          fetchTags();
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  }, []);

  const fetchTags = async () => {
    try {
      const response = await tagsAPI.getTags();
      if (response && response.tags) {
        setTags(response.tags);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    }
  };

  const handleLogin = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    fetchTags();
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setTags([]);
    setCurrentView('home');
    setSelectedTag('');
    setEditingPost(null);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSelectedTag('');
    setEditingPost(null);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
    setCurrentView('home');
  };

  const handlePostSave = () => {
    setEditingPost(null);
    setCurrentView('home');
    fetchTags(); // Обновляем теги после создания поста
  };

  const handlePostEdit = (post: Post) => {
    setEditingPost(post);
    setCurrentView('create');
  };

  const handlePostDelete = async (postId: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот пост?')) {
      try {
        await postsAPI.deletePost(postId);
        fetchTags(); // Обновляем теги после удаления поста
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  };

  const handleCommentAdded = (postId: number, comment: Comment) => {
    // This will be handled by individual page components
  };

  const handleFollowToggle = () => {
    // This will trigger stats refresh in ProfilePage
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation
        currentView={currentView}
        onViewChange={handleViewChange}
        selectedTag={selectedTag}
        onTagSelect={handleTagSelect}
        tags={tags}
        user={user}
        onSignOut={handleSignOut}
      />
      
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          {currentView === 'home' && (
            <HomePage
              user={user}
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
              onEditPost={handlePostEdit}
              onDeletePost={handlePostDelete}
              onFollowToggle={handleFollowToggle}
            />
          )}
          
          {currentView === 'following' && (
            <FollowingPage
              user={user}
              onEditPost={handlePostEdit}
              onDeletePost={handlePostDelete}
              onTagClick={handleTagSelect}
              onFollowToggle={handleFollowToggle}
            />
          )}
          
          {currentView === 'create' && (
            <PostEditor
              post={editingPost}
              onSave={handlePostSave}
              onCancel={() => {
                setEditingPost(null);
                setCurrentView('home');
              }}
            />
          )}
          
          {currentView === 'profile' && (
            <ProfilePage
              user={user}
              onEditPost={handlePostEdit}
              onDeletePost={handlePostDelete}
              onTagClick={handleTagSelect}
              onCreatePost={() => setCurrentView('create')}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 