import { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, Folder } from "lucide-react";
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
  const [categoryType, setCategoryType] = useState<'expense' | 'income' | 'savings'>('expense');
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366f1');
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Keep focus on name input when dialog opens
  useEffect(() => {
    if (isAddOpen && nameInputRef.current) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAddOpen, activeTab]);

  // 1. РОДИТЕЛИ (Группы) - категории без parent_id, отфильтрованные по типу
  const rootCategories = categories?.filter(c => !c.parent_id && c.parent_id !== c.id && c.type === categoryType) || [];

  // 2. Функция получения ДЕТЕЙ (Подкатегорий)
  const getSubcategories = (parentId: string) => 
    categories?.filter(c => c.parent_id === parentId && c.id !== parentId) || [];

  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', 
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
  ];

  const emojiCategories = ['🍔', '🚕', '🏠', '💳', '🛒', '☕', '🎬', '⚡', '💊', '👕', '📱', '🎮', '✈️', '🎁', '💰', '💵', '💼', '📈', '🎯', '💎', '🏆', '💸', '🤝', '📊'];

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
    setCategoryType(category.type);
    setActiveTab(category.parent_id ? 'subcategory' : 'group');
    setSelectedParentId(category.parent_id || '');
    setIsAddOpen(true);
  };

  const handleDelete = (category: Category) => {
    const children = getSubcategories(category.id);
    const hasChildren = children.length > 0;
    const message = hasChildren 
      ? `Удалить группу "${category.name}"?\n\nВнимание: Все подкатегории (${children.length}) также будут удалены.`
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
    setActiveTab('group');
    setSelectedParentId('');
  };

  const CategoryDialog = () => (
    <div className="space-y-6">
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => {
          setActiveTab(v as 'group' | 'subcategory');
          // Reset editing mode when switching tabs
          if (editingCategory) {
            setEditingCategory(null);
            setCategoryName('');
            setCategoryIcon('');
            setCategoryColor('#6366f1');
            setSelectedParentId('');
          }
        }}
      >
        {/* Показываем вкладки только если редактируем существующую категорию */}
        {editingCategory && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="group">
              Создать Группу
            </TabsTrigger>
            <TabsTrigger value="subcategory">
              Создать Подкатегорию
            </TabsTrigger>
          </TabsList>
        )}

        {/* TAB 1: Create Group */}
        <TabsContent value="group" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Тип категории</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={categoryType === 'expense' ? 'default' : 'outline'}
                onClick={() => setCategoryType('expense')}
                className={cn(
                  "h-10 font-semibold",
                  categoryType === 'expense' && "bg-rose-500 hover:bg-rose-600 text-white"
                )}
              >
                Расход
              </Button>
              <Button
                type="button"
                variant={categoryType === 'income' ? 'default' : 'outline'}
                onClick={() => setCategoryType('income')}
                className={cn(
                  "h-10 font-semibold",
                  categoryType === 'income' && "bg-emerald-500 hover:bg-emerald-600 text-white"
                )}
              >
                Доход
              </Button>
              <Button
                type="button"
                variant={categoryType === 'savings' ? 'default' : 'outline'}
                onClick={() => setCategoryType('savings')}
                className={cn(
                  "h-10 font-semibold",
                  categoryType === 'savings' && "bg-blue-500 hover:bg-blue-600 text-white"
                )}
              >
                Сбережение
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Название группы</Label>
            <Input
              ref={nameInputRef}
              placeholder="Например: Транспорт"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Иконка</Label>
            <div className="grid grid-cols-7 gap-2">
              {emojiCategories.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setCategoryIcon(emoji)}
                  className={cn(
                    "w-10 h-10 flex items-center justify-center text-lg rounded-lg border-2 transition-all hover:scale-110",
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
                  type="button"
                  onClick={() => setCategoryColor(color)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all hover:scale-110",
                    categoryColor === color ? 'border-foreground ring-2 ring-offset-2 ring-primary' : 'border-border'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: Create Subcategory - только при редактировании */}
        {editingCategory && (
          <TabsContent value="subcategory" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Выберите группу</Label>
              <Select value={selectedParentId} onValueChange={setSelectedParentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите родительскую группу" />
                </SelectTrigger>
                <SelectContent>
                  {rootCategories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Нет доступных групп типа "{categoryType === 'expense' ? 'Расход' : categoryType === 'income' ? 'Доход' : 'Сбережение'}". Создайте группу сначала.
                    </div>
                  ) : (
                    rootCategories.map((group) => (
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
                ref={nameInputRef}
                placeholder="Например: Такси"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Иконка (опционально)</Label>
              <div className="grid grid-cols-7 gap-2">
                {emojiCategories.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCategoryIcon(emoji)}
                    className={cn(
                      "w-10 h-10 flex items-center justify-center text-lg rounded-lg border-2 transition-all hover:scale-110",
                      categoryIcon === emoji ? 'border-primary bg-primary/10' : 'border-border'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
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
                    {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
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
                    {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
                  </DialogTitle>
                </DialogHeader>
                <CategoryDialog />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      {/* ВКЛАДКИ ТИПОВ КАТЕГОРИЙ */}
      <div className="px-4 md:px-6 pt-6">
        <Tabs value={categoryType} onValueChange={(v) => setCategoryType(v as 'expense' | 'income' | 'savings')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger 
              value="expense" 
              className="data-[state=active]:bg-rose-500/10 data-[state=active]:text-rose-600 font-semibold"
            >
              Расходы
            </TabsTrigger>
            <TabsTrigger 
              value="income" 
              className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600 font-semibold"
            >
              Доходы
            </TabsTrigger>
            <TabsTrigger 
              value="savings" 
              className="data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600 font-semibold"
            >
              Сбережения
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

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
        ) : rootCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 mb-6">
              <Folder className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground font-manrope mb-3">
              Нет категорий
            </h2>
            <p className="text-base text-muted-foreground font-inter mb-6 max-w-sm mx-auto">
              {categoryType === 'expense' && 'Создайте свою первую группу расходов, чтобы начать отслеживать финансы'}
              {categoryType === 'income' && 'Создайте группу доходов для учета ваших поступлений'}
              {categoryType === 'savings' && 'Создайте группу сбережений для контроля накоплений'}
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
          <Accordion type="multiple" className="w-full space-y-4">
            {rootCategories.map((group) => {
              const subcategories = getSubcategories(group.id);
              
              return (
                <AccordionItem 
                  key={group.id} 
                  value={group.id}
                  className="border border-border rounded-xl px-4 bg-card shadow-sm"
                >
                  {/* ЗАГОЛОВОК ГРУППЫ */}
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3 w-full">
                      {/* Иконка с защитой от сжатия */}
                      <div 
                        className="h-10 w-10 rounded-full flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: `${group.color}20` || '#6366f120' }}
                      >
                        {group.icon || "📁"}
                      </div>
                      
                      <div className="text-left flex-1">
                        <p className="font-semibold text-foreground font-manrope">
                          {group.name}
                        </p>
                        <p className="text-xs text-muted-foreground font-inter">
                          {subcategories.length} {subcategories.length === 1 ? 'подкатегория' : 'подкатегорий'}
                        </p>
                      </div>

                      {/* Кнопки управления группой */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(group);
                        }}
                        className="shrink-0 h-8 w-8"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(group);
                        }}
                        className="shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionTrigger>

                  {/* СОДЕРЖИМОЕ (ПОДКАТЕГОРИИ) */}
                  <AccordionContent className="pb-4 pt-0">
                    <div className="pl-4 ml-5 border-l-2 border-primary/30 space-y-3 mt-2">
                      {subcategories.length === 0 ? (
                        <p className="text-sm text-muted-foreground pl-4 py-2 font-inter">
                          Нет подкатегорий
                        </p>
                      ) : (
                        subcategories.map((sub) => (
                          <div 
                            key={sub.id} 
                            className="flex items-center justify-between group/item pl-4 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-muted-foreground">↳</span>
                              <span className="text-lg">{sub.icon}</span>
                              <span className="text-foreground font-inter font-medium">
                                {sub.name}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                onClick={() => handleEdit(sub)}
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover/item:opacity-100 transition-opacity"
                                onClick={() => handleDelete(sub)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </AccordionContent>
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
