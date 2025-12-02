import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories, Category } from "@/hooks/use-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

const Categories = () => {
  const isMobile = useIsMobile();
  const { categoriesTree, isLoading, addCategory, updateCategory, deleteCategory, isAddingCategory, isUpdatingCategory, isDeletingCategory } = useCategories();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366f1');
  const [parentId, setParentId] = useState<string | null>(null);

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const emojiCategories = {
    expense: ['🍔', '🚕', '🏠', '💳', '🛒', '☕', '🎬', '⚡', '💊', '👕', '📱', '🎮', '✈️', '🎁'],
    income: ['💰', '💵', '💼', '📈', '🎯', '💎', '🏆', '💸', '🤝', '📊']
  };

  const handleSave = () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      updateCategory({
        id: editingCategory.id,
        updates: {
          name: categoryName,
          icon: categoryIcon,
          color: categoryColor,
          type: categoryType,
        }
      });
    } else {
      addCategory({
        name: categoryName,
        type: categoryType,
        icon: categoryIcon,
        color: categoryColor,
        parent_id: parentId,
      });
    }

    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon || '');
    setCategoryColor(category.color || '#6366f1');
    setCategoryType(category.type as 'expense' | 'income');
    setParentId(category.parent_id);
    setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить категорию? Все подкатегории также будут удалены.')) {
      deleteCategory(id);
    }
  };

  const resetForm = () => {
    setIsAddOpen(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('');
    setCategoryColor('#6366f1');
    setCategoryType('expense');
    setParentId(null);
  };

  const CategoryForm = () => (
    <div className="space-y-6">
      <Tabs value={categoryType} onValueChange={(v) => setCategoryType(v as 'expense' | 'income')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expense">Расход</TabsTrigger>
          <TabsTrigger value="income">Доход</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label>Название</Label>
        <Input
          placeholder="Например: Продукты"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Иконка</Label>
        <div className="grid grid-cols-7 gap-2">
          {emojiCategories[categoryType].map((emoji) => (
            <button
              key={emoji}
              onClick={() => setCategoryIcon(emoji)}
              className={`text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                categoryIcon === emoji ? 'border-primary bg-primary/10' : 'border-border'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Цвет</Label>
        <div className="grid grid-cols-8 gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setCategoryColor(color)}
              className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                categoryColor === color ? 'border-foreground ring-2 ring-offset-2 ring-primary' : 'border-border'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="w-full h-12 text-base font-semibold rounded-2xl"
        disabled={!categoryName.trim() || isAddingCategory || isUpdatingCategory}
      >
        {(isAddingCategory || isUpdatingCategory) ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Сохранение...
          </>
        ) : (
          editingCategory ? 'Обновить' : 'Создать'
        )}
      </Button>
    </div>
  );

  const CategoryCard = ({ category }: { category: Category }) => (
    <Card className="group hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl text-2xl"
            style={{ backgroundColor: `${category.color}15` }}
          >
            {category.icon}
          </div>
          
          <div className="flex-1">
            <p className="font-semibold font-inter text-foreground">{category.name}</p>
            <p className="text-xs text-muted-foreground">
              {category.type === 'expense' ? 'Расход' : 'Доход'}
              {category.children && category.children.length > 0 && ` • ${category.children.length} подкат.`}
            </p>
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(category)}
              disabled={isUpdatingCategory}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(category.id)}
              disabled={isDeletingCategory}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mt-3 ml-4 space-y-2 border-l-2 border-border pl-4">
            {category.children.map((child) => (
              <div key={child.id} className="flex items-center gap-2">
                <span className="text-lg">{child.icon}</span>
                <span className="text-sm font-inter text-muted-foreground">{child.name}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <header className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold font-manrope text-foreground">Категории</h1>
          
          {isMobile ? (
            <Drawer open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DrawerTrigger asChild>
                <Button size="icon" className="rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[90vh]">
                <DrawerHeader>
                  <DrawerTitle className="text-2xl font-bold font-manrope">
                    {editingCategory ? 'Редактировать' : 'Новая категория'}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 overflow-y-auto">
                  <CategoryForm />
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="rounded-full">
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold font-manrope">
                    {editingCategory ? 'Редактировать' : 'Новая категория'}
                  </DialogTitle>
                </DialogHeader>
                <CategoryForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-2xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : categoriesTree.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-semibold text-foreground font-inter mb-2">Нет категорий</p>
            <p className="text-sm text-muted-foreground font-inter">
              Создайте первую категорию для учета расходов и доходов
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categoriesTree.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
