import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    testId?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    testId,
}: StatsCardProps) {
    return (
        <Card
            className={cn(
                "hover:shadow-lg transition-all duration-200 hover:-translate-y-1",
                className
            )}
            data-testid={testId}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}
                        >
                            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
