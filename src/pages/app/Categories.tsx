import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCategories, Category } from "@/hooks/use-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Categories = () => {
  const isMobile = useIsMobile();
  const { categories, categoriesTree, isLoading, addCategory, updateCategory, deleteCategory, isAddingCategory, isUpdatingCategory, isDeletingCategory } = useCategories();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366f1');
  const [isSubcategory, setIsSubcategory] = useState(false);
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
    if (isSubcategory && !parentId) return;

    if (editingCategory) {
      updateCategory({
        id: editingCategory.id,
        updates: {
          name: categoryName,
          icon: categoryIcon,
          color: categoryColor,
          type: categoryType,
          parent_id: isSubcategory ? parentId : null,
        }
      });
    } else {
      addCategory({
        name: categoryName,
        type: categoryType,
        icon: categoryIcon,
        color: categoryColor,
        parent_id: isSubcategory ? parentId : null,
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
    setIsSubcategory(!!category.parent_id);
    setParentId(category.parent_id);
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
    setIsSubcategory(false);
    setParentId(null);
  };

  // Get parent categories for the selected type
  const parentCategories = categories.filter(
    c => c.type === categoryType && !c.parent_id
  );

  const CategoryForm = () => (
    <div className="space-y-6">
      <Tabs value={categoryType} onValueChange={(v) => {
        setCategoryType(v as 'expense' | 'income');
        setParentId(null); // Reset parent when changing type
      }}>
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

      {/* Subcategory Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/50">
        <div className="space-y-0.5">
          <Label className="text-base">Это подкатегория</Label>
          <p className="text-sm text-muted-foreground">
            Вложенная категория внутри родительской
          </p>
        </div>
        <Switch
          checked={isSubcategory}
          onCheckedChange={(checked) => {
            setIsSubcategory(checked);
            if (!checked) setParentId(null);
          }}
        />
      </div>

      {/* Parent Category Selection */}
      {isSubcategory && (
        <div className="space-y-2">
          <Label>Родительская категория</Label>
          <Select value={parentId || undefined} onValueChange={setParentId}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите родителя" />
            </SelectTrigger>
            <SelectContent>
              {parentCategories.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground text-center">
                  Нет родительских категорий
                </div>
              ) : (
                parentCategories.map((cat) => (
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
      )}

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

      <Button
        onClick={handleSave}
        className="w-full h-12 text-base font-semibold rounded-2xl"
        disabled={!categoryName.trim() || (isSubcategory && !parentId) || isAddingCategory || isUpdatingCategory}
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

  const CategoryItem = ({ category, isChild = false }: { category: Category; isChild?: boolean }) => (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group",
      isChild && "ml-8 border-l-2 border-border pl-4"
    )}>
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0"
        style={{ backgroundColor: `${category.color}15` }}
      >
        {category.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-inter truncate",
          isChild ? "text-sm text-muted-foreground" : "text-base font-semibold text-foreground"
        )}>
          {category.name}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(category)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Редактировать
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(category)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
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
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-5 w-48 flex-1" />
              </div>
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
          <Accordion type="multiple" className="space-y-2">
            {categoriesTree.map((category) => {
              const hasChildren = category.children && category.children.length > 0;
              
              return (
                <AccordionItem 
                  key={category.id} 
                  value={category.id}
                  className="border border-border rounded-2xl bg-card overflow-hidden"
                >
                  {hasChildren ? (
                    <>
                      <AccordionTrigger className="hover:no-underline px-4 py-3 hover:bg-muted/50">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-xl shrink-0"
                            style={{ backgroundColor: `${category.color}15` }}
                          >
                            {category.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-base font-semibold text-foreground font-inter">
                              {category.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {category.children?.length} подкатегор{category.children?.length === 1 ? 'ия' : category.children?.length && category.children.length < 5 ? 'ии' : 'ий'}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="shrink-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(category)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Редактировать
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(category)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-3 pt-0">
                        <div className="space-y-1 border-l-2 border-border ml-5 pl-4">
                          {category.children?.map((child) => (
                            <CategoryItem key={child.id} category={child} isChild />
                          ))}
                        </div>
                      </AccordionContent>
                    </>
                  ) : (
                    <div className="px-4 py-3">
                      <CategoryItem category={category} />
                    </div>
                  )}
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default Categories;
