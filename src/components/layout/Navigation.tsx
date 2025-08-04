import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Users, PlusCircle, Home, Hash, LogOut } from 'lucide-react';
import { User as UserType, Tag } from '@/types';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  selectedTag?: string;
  onTagSelect?: (tag: string) => void;
  tags?: Tag[];
  user: UserType;
  onSignOut: () => void;
}

export function Navigation({
  currentView,
  onViewChange,
  selectedTag,
  onTagSelect,
  tags,
  user,
  onSignOut
}: NavigationProps) {
  return (
    <div className="w-64 bg-white border-r min-h-screen p-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Avatar>
            <AvatarFallback>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium">{user?.username}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            variant={currentView === 'home' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('home')}
          >
            <Home className="h-4 w-4 mr-2" />
            Главная
          </Button>
          
          <Button
            variant={currentView === 'following' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('following')}
          >
            <Users className="h-4 w-4 mr-2" />
            Подписки
          </Button>
          
          <Button
            variant={currentView === 'create' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('create')}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Создать пост
          </Button>
          
          <Button
            variant={currentView === 'profile' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('profile')}
          >
            <User className="h-4 w-4 mr-2" />
            Профиль
          </Button>
        </div>

        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <Hash className="h-4 w-4" />
              <span className="font-medium">Популярные теги</span>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {tags.slice(0, 10).map((tag) => (
                <Button
                  key={tag.name}
                  variant={selectedTag === tag.name ? 'default' : 'ghost'}
                  className="w-full justify-between"
                  onClick={() => onTagSelect?.(tag.name)}
                >
                  <span>#{tag.name}</span>
                  <Badge variant="secondary">
                    {tag.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </div>
  );
} 