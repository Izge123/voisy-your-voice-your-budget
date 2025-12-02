import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, CornerDownRight, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useCategories, Category } from "@/hooks/use-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Categories = () => {
  const isMobile = useIsMobile();
  const { categories, categoriesTree, isLoading, addCategory, updateCategory, deleteCategory, isAddingCategory, isUpdatingCategory, isDeletingCategory } = useCategories();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'parent' | 'child'>('parent');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366f1');
  const [parentId, setParentId] = useState<string | null>(null);

  // Fix broken data: categories where parent_id = id
  const fixBrokenCategories = async () => {
    const brokenCategories = categories.filter(c => c.parent_id === c.id);
    if (brokenCategories.length > 0) {
      console.log('Fixing broken categories:', brokenCategories);
      for (const cat of brokenCategories) {
        await updateCategory({
          id: cat.id,
          updates: { parent_id: null }
        });
      }
    }
  };

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
    if (activeTab === 'child' && !parentId) return;

    // Calculate the correct parent_id value
    let finalParentId: string | null = null;
    if (activeTab === 'child' && parentId) {
      // Never allow a category to be its own parent
      finalParentId = editingCategory && parentId === editingCategory.id ? null : parentId;
    }

    if (editingCategory) {
      updateCategory({
        id: editingCategory.id,
        updates: {
          name: categoryName,
          icon: categoryIcon,
          color: categoryColor,
          type: categoryType,
          parent_id: finalParentId,
        }
      });
    } else {
      addCategory({
        name: categoryName,
        type: categoryType,
        icon: categoryIcon,
        color: categoryColor,
        parent_id: finalParentId,
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
    
    // Fix: treat self-referencing parent_id as null (no parent)
    const hasValidParent = category.parent_id && category.parent_id !== category.id;
    setActiveTab(hasValidParent ? 'child' : 'parent');
    setParentId(hasValidParent ? category.parent_id : null);
    setIsAddOpen(true);
  };

  const handleDelete = (category: Category) => {
    const hasChildren = category.children && category.children.length > 0;
    const message = hasChildren 
      ? `Удалить категорию "${category.name}"?\n\nВнимание: Все подкатегории (${category.children?.length}) также будут удалены.`
      : `Удалить категорию "${category.name}"?`;
    
    if (confirm(message)) {
      deleteCategory(category.id);
    }
  };

  const resetForm = () => {
    setIsAddOpen(false);
    setEditingCategory(null);
    setCategoryName('');
    setCategoryIcon('');
    setCategoryColor('#6366f1');
    setCategoryType('expense');
    setActiveTab('parent');
    setParentId(null);
  };

  // Get parent categories for the selected type
  const parentCategories = categories.filter(
    c => c.type === categoryType && !c.parent_id
  );

  const CategoryForm = () => (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'parent' | 'child')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parent">Новая Группа</TabsTrigger>
          <TabsTrigger value="child">Подкатегория</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 'parent' && (
        <>
          <Tabs value={categoryType} onValueChange={(v) => setCategoryType(v as 'expense' | 'income')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Расход</TabsTrigger>
              <TabsTrigger value="income">Доход</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Название группы</Label>
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
                  className={cn(
                    "text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110",
                    categoryIcon === emoji ? 'border-primary bg-primary/10' : 'border-border'
                  )}
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
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                    categoryColor === color ? 'border-foreground ring-2 ring-offset-2 ring-primary' : 'border-border'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'child' && (
        <>
          <div className="space-y-2">
            <Label>Родительская категория</Label>
            <Select value={parentId || undefined} onValueChange={(id) => {
              setParentId(id);
              const parent = categories.find(c => c.id === id);
              if (parent) {
                setCategoryType(parent.type as 'expense' | 'income');
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите родителя" />
              </SelectTrigger>
              <SelectContent>
                {categories.filter(c => !c.parent_id).length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Нет родительских категорий
                  </div>
                ) : (
                  categories.filter(c => !c.parent_id).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Название подкатегории</Label>
            <Input
              placeholder="Например: Алкоголь"
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
                  className={cn(
                    "text-2xl p-2 rounded-lg border-2 transition-all hover:scale-110",
                    categoryIcon === emoji ? 'border-primary bg-primary/10' : 'border-border'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <Button
        onClick={handleSave}
        className="w-full h-12 text-base font-semibold rounded-2xl"
        disabled={!categoryName.trim() || (activeTab === 'child' && !parentId) || isAddingCategory || isUpdatingCategory}
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

  // Simple flat list rendering with visual hierarchy
  const CategoryItem = ({ category, isChild = false }: { category: Category; isChild?: boolean }) => (
    <div className={cn(
      "flex items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors group bg-card border border-border",
      isChild && "ml-12 border-l-4 border-l-primary/30"
    )}>
      {isChild && (
        <CornerDownRight className="w-4 h-4 text-muted-foreground shrink-0" />
      )}
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.icon || (isChild ? '📄' : <Folder className="w-5 h-5" />)}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-manrope truncate",
          isChild ? "text-base font-medium text-foreground" : "text-lg font-bold text-foreground"
        )}>
          {category.name}
        </p>
        {!isChild && category.children && category.children.length > 0 && (
          <p className="text-xs text-muted-foreground font-inter">
            {category.children.length} {category.children.length === 1 ? 'подкатегория' : 'подкатегории'}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        onClick={() => handleEdit(category)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive shrink-0"
        onClick={() => handleDelete(category)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-6">
      <header className="p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-manrope text-foreground">Категории</h1>
            {/* Debug: Show if there are broken categories */}
            {categories.some(c => c.parent_id === c.id) && (
              <Button
                onClick={fixBrokenCategories}
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
              >
                Исправить поломанные данные
              </Button>
            )}
          </div>
          
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
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-48 flex-1" />
              </div>
            ))}
          </div>
        ) : categoriesTree.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
              <Folder className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground font-manrope mb-3">
              Нет категорий
            </h2>
            <p className="text-base text-muted-foreground font-inter mb-6 max-w-sm mx-auto">
              Создайте свою первую группу расходов, чтобы начать отслеживать финансы
            </p>
            <Button
              onClick={() => setIsAddOpen(true)}
              size="lg"
              className="rounded-2xl font-semibold"
            >
              <Plus className="mr-2 h-5 w-5" />
              Создать группу
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {categoriesTree.map((category) => (
              <div key={category.id} className="space-y-2">
                {/* Parent Category */}
                <CategoryItem category={category} />
                
                {/* Subcategories - Always visible */}
                {category.children && category.children.length > 0 && (
                  <>
                    {category.children.map((child) => (
                      <CategoryItem key={child.id} category={child} isChild />
                    ))}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
