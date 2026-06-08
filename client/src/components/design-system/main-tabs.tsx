import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const triggerClass = cn(
  "gap-2 text-sm font-semibold rounded-lg h-10 transition-all duration-200",
  "text-muted-foreground hover:text-[#004080] hover:bg-[#004080]/5",
  "data-[state=active]:bg-[#004080] data-[state=active]:text-white data-[state=active]:shadow-md",
  "data-[state=active]:hover:bg-[#003366] data-[state=active]:hover:text-white",
  "focus-visible:ring-2 focus-visible:ring-[#004080]/40 focus-visible:ring-offset-2",
);

interface TabItem {
  value: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

interface MainTabsProps {
  defaultValue: string;
  tabs: TabItem[];
  className?: string;
}

export function MainTabs({ defaultValue, tabs, className }: MainTabsProps) {
  return (
    <Tabs defaultValue={defaultValue} className={cn("w-full", className)}>
      <div className="rounded-xl border border-[#004080]/10 bg-card shadow-sm overflow-hidden uupm-card">
        <TabsList
          className={cn(
            "grid w-full h-auto p-1.5 gap-1.5 rounded-none border-b border-[#004080]/10",
            "bg-gradient-to-r from-[#004080]/8 via-[#004080]/5 to-transparent",
            tabs.length === 1 ? "grid-cols-1" : "grid-cols-2",
          )}
        >
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className={triggerClass}>
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
