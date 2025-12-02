import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, Folder, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useCategories, Category } from "@/hooks/use-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const Categories = () => {
  const isMobile = useIsMobile();
  const { 
    categories, 
    categoriesTree, 
    isLoading, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    isAddingCategory, 
    isUpdatingCategory 
  } = useCategories();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeTab, setActiveTab] = useState<'group' | 'subcategory'>('group');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366f1');
  const [selectedParentId, setSelectedParentId] = useState<string>('');

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

  // Get only parent categories (groups) for selection in subcategory tab
  const parentGroups = categories.filter(c => !c.parent_id);

  const handleSave = () => {
    if (!categoryName.trim()) return;
    if (activeTab === 'subcategory' && !selectedParentId) return;

    const categoryData = {
      name: categoryName,
      type: categoryType,
      icon: categoryIcon || null,
      color: categoryColor,
      parent_id: activeTab === 'subcategory' ? selectedParentId : null,
    };

    if (editingCategory) {
      updateCategory({
        id: editingCategory.id,
        updates: categoryData
      });
    } else {
      addCategory(categoryData);
    }

    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryIcon(category.icon || '');
    setCategoryColor(category.color || '#6366f1');
    setCategoryType(category.type as 'expense' | 'income');
    setActiveTab(category.parent_id ? 'subcategory' : 'group');
    setSelectedParentId(category.parent_id || '');
    setIsAddOpen(true);
  };

  const handleDelete = (category: Category) => {
    const hasChildren = category.children && category.children.length > 0;
    const message = hasChildren 
      ? `Удалить группу "${category.name}"?\n\nВнимание: Все подкатегории (${category.children?.length}) также будут удалены.`
      : `Удалить "${category.name}"?`;
    
    if (window.confirm(message)) {
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
    setActiveTab('group');
    setSelectedParentId('');
  };

  const CategoryDialog = () => (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'group' | 'subcategory')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="group">Создать Группу</TabsTrigger>
          <TabsTrigger value="subcategory">Создать Подкатегорию</TabsTrigger>
        </TabsList>

        {/* TAB 1: Create Group */}
        <TabsContent value="group" className="space-y-4 mt-4">
          <Tabs value={categoryType} onValueChange={(v) => setCategoryType(v as 'expense' | 'income')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense">Расход</TabsTrigger>
              <TabsTrigger value="income">Доход</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label>Название группы</Label>
            <Input
              placeholder="Например: Транспорт"
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
        </TabsContent>

        {/* TAB 2: Create Subcategory */}
        <TabsContent value="subcategory" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Выберите группу</Label>
            <Select value={selectedParentId} onValueChange={(value) => {
              setSelectedParentId(value);
              const parent = categories.find(c => c.id === value);
              if (parent) {
                setCategoryType(parent.type as 'expense' | 'income');
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите родительскую группу" />
              </SelectTrigger>
              <SelectContent>
                {parentGroups.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    Нет доступных групп. Создайте группу сначала.
                  </div>
                ) : (
                  parentGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{group.icon}</span>
                        <span>{group.name}</span>
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
              placeholder="Например: Такси"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Иконка (опционально)</Label>
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
        </TabsContent>
      </Tabs>

      <Button
        onClick={handleSave}
        className="w-full h-12 text-base font-semibold rounded-2xl"
        disabled={
          !categoryName.trim() || 
          (activeTab === 'subcategory' && !selectedParentId) || 
          isAddingCategory || 
          isUpdatingCategory
        }
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
                    {editingCategory ? 'Редактировать' : 'Добавить категорию'}
                  </DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-6 overflow-y-auto">
                  <CategoryDialog />
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
                    {editingCategory ? 'Редактировать' : 'Добавить категорию'}
                  </DialogTitle>
                </DialogHeader>
                <CategoryDialog />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border border-border rounded-2xl">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
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
          <Accordion type="multiple" className="space-y-3">
            {categoriesTree.map((group) => {
              const hasChildren = group.children && group.children.length > 0;
              
              return (
                <AccordionItem 
                  key={group.id} 
                  value={group.id}
                  className="border-2 border-border rounded-2xl bg-card overflow-hidden shadow-sm"
                >
                  <div className="flex items-center gap-3 px-4 py-4">
                    {/* Icon with color */}
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl text-2xl shrink-0"
                      style={{ backgroundColor: `${group.color}20` }}
                    >
                      {group.icon || <Folder className="w-6 h-6" style={{ color: group.color }} />}
                    </div>
                    
                    {/* Group info - clickable to expand */}
                    <AccordionTrigger className="flex-1 hover:no-underline py-0 [&[data-state=open]>svg]:rotate-180">
                      <div className="flex items-center justify-between w-full pr-2">
                        <div className="text-left">
                          <p className="text-lg font-bold text-foreground font-manrope">
                            {group.name}
                          </p>
                          {hasChildren && (
                            <p className="text-sm text-muted-foreground font-inter">
                              {group.children?.length} {group.children?.length === 1 ? 'подкатегория' : 'подкатегории'}
                            </p>
                          )}
                        </div>
                        <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200" />
                      </div>
                    </AccordionTrigger>

                    {/* Edit button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(group);
                      }}
                      className="shrink-0"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {/* Delete button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group);
                      }}
                      className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Subcategories */}
                  {hasChildren && (
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="space-y-2 pl-4 border-l-2 border-border ml-6">
                        {group.children?.map((subcategory) => (
                          <div 
                            key={subcategory.id}
                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                          >
                            <div
                              className="flex items-center justify-center w-8 h-8 rounded-lg text-lg shrink-0"
                              style={{ backgroundColor: `${subcategory.color || group.color}15` }}
                            >
                              {subcategory.icon || '📄'}
                            </div>
                            
                            <p className="flex-1 text-base font-medium text-foreground font-inter">
                              {subcategory.name}
                            </p>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(subcategory)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0"
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(subcategory)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
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
