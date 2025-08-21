import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

export interface FilterConfig {
    categories?: string[];
    roles?: string[];
    statuses?: string[];
    priceRange?: { min: number; max: number };
    dateRange?: { from: Date | undefined; to: Date | undefined };
}

interface AdvancedFiltersProps {
    filters: FilterConfig;
    onFiltersChange: (filters: FilterConfig) => void;
    availableCategories?: string[];
    availableRoles?: string[];
    availableStatuses?: string[];
    showPriceFilter?: boolean;
    showDateFilter?: boolean;
}

export function AdvancedFilters({
    filters,
    onFiltersChange,
    availableCategories = [],
    availableRoles = [],
    availableStatuses = [],
    showPriceFilter = false,
    showDateFilter = false,
}: AdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleCategoryChange = (category: string) => {
        const current = filters.categories || [];
        const updated = current.includes(category)
            ? current.filter((c) => c !== category)
            : [...current, category];
        onFiltersChange({ ...filters, categories: updated });
    };

    const handleRoleChange = (role: string) => {
        const current = filters.roles || [];
        const updated = current.includes(role)
            ? current.filter((r) => r !== role)
            : [...current, role];
        onFiltersChange({ ...filters, roles: updated });
    };

    const handleStatusChange = (status: string) => {
        const current = filters.statuses || [];
        const updated = current.includes(status)
            ? current.filter((s) => s !== status)
            : [...current, status];
        onFiltersChange({ ...filters, statuses: updated });
    };

    const handlePriceChange = (values: number[]) => {
        onFiltersChange({
            ...filters,
            priceRange: { min: values[0], max: values[1] },
        });
    };

    const handleDateChange = (type: "from" | "to", date: Date | undefined) => {
        onFiltersChange({
            ...filters,
            dateRange: {
                from: type === "from" ? date : filters.dateRange?.from,
                to: type === "to" ? date : filters.dateRange?.to,
            },
        });
    };

    const handleReset = () => {
        onFiltersChange({
            categories: [],
            roles: [],
            statuses: [],
            priceRange: undefined,
            dateRange: undefined,
        });
    };

    const activeFilterCount =
        (filters.categories?.length || 0) +
        (filters.roles?.length || 0) +
        (filters.statuses?.length || 0) +
        (filters.priceRange ? 1 : 0) +
        (filters.dateRange?.from || filters.dateRange?.to ? 1 : 0);

    return (
        <div className="relative">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="relative">
                        <Filter className="w-4 h-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge
                                variant="default"
                                className="ml-2 px-1.5 py-0.5 text-xs"
                            >
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">Advanced Filters</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleReset}
                                className="h-auto p-1 text-xs"
                            >
                                Reset All
                            </Button>
                        </div>

                        {/* Categories */}
                        {availableCategories.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Categories</Label>
                                <div className="flex flex-wrap gap-2">
                                    {availableCategories.map((category) => (
                                        <Badge
                                            key={category}
                                            variant={
                                                filters.categories?.includes(category)
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="cursor-pointer"
                                            onClick={() => handleCategoryChange(category)}
                                        >
                                            {category}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Roles */}
                        {availableRoles.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Roles</Label>
                                <div className="flex flex-wrap gap-2">
                                    {availableRoles.map((role) => (
                                        <Badge
                                            key={role}
                                            variant={
                                                filters.roles?.includes(role) ? "default" : "outline"
                                            }
                                            className="cursor-pointer"
                                            onClick={() => handleRoleChange(role)}
                                        >
                                            {role}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Statuses */}
                        {availableStatuses.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Status</Label>
                                <div className="flex flex-wrap gap-2">
                                    {availableStatuses.map((status) => (
                                        <Badge
                                            key={status}
                                            variant={
                                                filters.statuses?.includes(status)
                                                    ? "default"
                                                    : "outline"
                                            }
                                            className="cursor-pointer"
                                            onClick={() => handleStatusChange(status)}
                                        >
                                            {status}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Price Range */}
                        {showPriceFilter && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                    Price Range: ${filters.priceRange?.min || 0} - $
                                    {filters.priceRange?.max || 1000}
                                </Label>
                                <Slider
                                    min={0}
                                    max={1000}
                                    step={10}
                                    value={[
                                        filters.priceRange?.min || 0,
                                        filters.priceRange?.max || 1000,
                                    ]}
                                    onValueChange={handlePriceChange}
                                    className="w-full"
                                />
                            </div>
                        )}

                        {/* Date Range */}
                        {showDateFilter && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Date Range</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {filters.dateRange?.from
                                                    ? format(filters.dateRange.from, "MMM dd")
                                                    : "From"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={filters.dateRange?.from}
                                                onSelect={(date) => handleDateChange("from", date)}
                                            />
                                        </PopoverContent>
                                    </Popover>

                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm" className="w-full">
                                                <CalendarIcon className="w-4 h-4 mr-2" />
                                                {filters.dateRange?.to
                                                    ? format(filters.dateRange.to, "MMM dd")
                                                    : "To"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={filters.dateRange?.to}
                                                onSelect={(date) => handleDateChange("to", date)}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {filters.categories?.map((category) => (
                        <Badge key={category} variant="secondary" className="gap-1">
                            {category}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleCategoryChange(category)}
                            />
                        </Badge>
                    ))}
                    {filters.roles?.map((role) => (
                        <Badge key={role} variant="secondary" className="gap-1">
                            {role}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleRoleChange(role)}
                            />
                        </Badge>
                    ))}
                    {filters.statuses?.map((status) => (
                        <Badge key={status} variant="secondary" className="gap-1">
                            {status}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleStatusChange(status)}
                            />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
