import { Check, X, AlertTriangle } from "lucide-react";
const ComparisonTable = () => {
  const features = [{
    name: "Ввод данных",
    voisy: {
      text: "Голосом (3 сек)",
      icon: "check"
    },
    banks: {
      text: "Авто (только карты)",
      icon: "warning"
    },
    excel: {
      text: "Руками (долго)",
      icon: "cross"
    }
  }, {
    name: "Наличные",
    voisy: {
      text: "Да",
      icon: "check"
    },
    banks: {
      text: "Нет",
      icon: "cross"
    },
    excel: {
      text: "Да",
      icon: "check"
    }
  }, {
    name: "Сплит чеков (AI)",
    voisy: {
      text: "Да",
      icon: "check"
    },
    banks: {
      text: "Базовая",
      icon: "warning"
    },
    excel: {
      text: "Нет",
      icon: "cross"
    }
  }, {
    name: "Советы",
    voisy: {
      text: "AI-аналитик",
      icon: "check"
    },
    banks: {
      text: "Реклама",
      icon: "cross"
    },
    excel: {
      text: "Нет",
      icon: "cross"
    }
  }];
  const getIcon = (type: string) => {
    switch (type) {
      case "check":
        return <Check className="h-5 w-5 text-secondary" />;
      case "cross":
        return <X className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };
  return <section className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-4">Почему Kapitallo лучше Excel?</h2>
        <p className="text-center text-muted-foreground font-inter mb-12 md:mb-16 max-w-2xl mx-auto">
          Сравните сами: старые методы vs умный финансовый помощник
        </p>

        {/* Comparison Table */}
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <div className="bg-card rounded-3xl border border-border shadow-xl overflow-hidden min-w-[600px]">
            {/* Header */}
            <div className="grid grid-cols-4 bg-muted/50 border-b border-border">
              <div className="p-4 md:p-6">
                <span className="text-sm md:text-base font-bold font-manrope text-foreground">Функция</span>
              </div>
              <div className="p-4 md:p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="flex items-center gap-2">
                  <span className="text-sm md:text-base font-bold font-manrope text-primary">Voisy</span>
                  <div className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-semibold">NEW</div>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <span className="text-sm md:text-base font-bold font-manrope text-foreground">Банки</span>
              </div>
              <div className="p-4 md:p-6">
                <span className="text-sm md:text-base font-bold font-manrope text-foreground">Excel</span>
              </div>
            </div>

            {/* Rows */}
            {features.map((feature, index) => <div key={index} className={`grid grid-cols-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? "" : "bg-muted/10"}`}>
                <div className="p-4 md:p-6">
                  <span className="text-sm md:text-base font-medium font-inter text-foreground">{feature.name}</span>
                </div>
                <div className="p-4 md:p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="flex items-center gap-2">
                    {getIcon(feature.voisy.icon)}
                    <span className="text-sm md:text-base font-medium font-inter text-foreground">{feature.voisy.text}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2">
                    {getIcon(feature.banks.icon)}
                    <span className="text-sm md:text-base font-inter text-muted-foreground">{feature.banks.text}</span>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center gap-2">
                    {getIcon(feature.excel.icon)}
                    <span className="text-sm md:text-base font-inter text-muted-foreground">{feature.excel.text}</span>
                  </div>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default ComparisonTable;