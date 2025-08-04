import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
    Edit,
    Trash2,
    MessageCircle,
    Eye,
    UserPlus,
    UserMinus
} from 'lucide-react';
import { Post, User, Comment } from '@/types';
import { commentsAPI, followAPI } from '@/lib/api';

interface PostCardProps {
  post: Post;
  user: User;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: number) => void;
  onTagClick?: (tag: string) => void;
  onCommentAdded?: (postId: number, comment: Comment) => void;
  onFollowToggle?: () => void;
}

export function PostCard({
  post,
  user,
  onEdit,
  onDelete,
  onTagClick,
  onCommentAdded,
  onFollowToggle
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const isAuthor = user?.id === post.author.id;

  useEffect(() => {
    if (!isAuthor && user) {
      checkFollowStatus();
    }
  }, [post.author.id, user, isAuthor]);

  const checkFollowStatus = async () => {
    try {
      const { isFollowing } = await followAPI.getFollowStatus(post.author.id);
      setIsFollowing(isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followAPI.unfollowUser(post.author.id);
        setIsFollowing(false);
      } else {
        await followAPI.followUser(post.author.id);
        setIsFollowing(true);
      }
      // Call callback to update stats
      onFollowToggle?.();
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const { comment } = await commentsAPI.addComment(post.id, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
      onCommentAdded?.(post.id, comment);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getVisibilityIcon = () => {
    if (!post.is_public) {
      return <Eye className="h-4 w-4 text-red-500" />;
    }
    if (post.is_request_only) {
      return <Eye className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {post.author.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{post.author.name}</span>
                {getVisibilityIcon()}
                {!isAuthor && (
                  <Button
                    size="sm"
                    variant={isFollowing ? "secondary" : "outline"}
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className="ml-2"
                  >
                    {followLoading ? (
                      '...'
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="h-3 w-3 mr-1" />
                        Отписаться
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1" />
                        Подписаться
                      </>
                    )}
                  </Button>
                )}
              </div>
              <span className="text-muted-foreground text-sm">
                {formatDate(post.created_at)}
                {post.updated_at !== post.created_at && ' (изменено)'}
              </span>
            </div>
          </div>
          
          {isAuthor && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(post)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(post.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">{post.title}</h3>
          <div className="whitespace-pre-wrap text-gray-700">{post.content}</div>
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-200"
                onClick={() => onTagClick?.(tag)}
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {comments.length} комментарий{comments.length !== 1 ? 'ев' : ''}
          </Button>
        </div>
        
        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            <form onSubmit={handleAddComment} className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Добавить комментарий..."
                className="min-h-[80px]"
              />
              <Button type="submit" size="sm" disabled={commentLoading}>
                {commentLoading ? 'Отправка...' : 'Отправить'}
              </Button>
            </form>
            
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {comment.author.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{comment.author.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 