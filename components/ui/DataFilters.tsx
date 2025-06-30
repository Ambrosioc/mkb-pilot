import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RefreshCw, Search, X } from 'lucide-react';

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    key: string;
    type: 'search' | 'select' | 'multi-select';
    label: string;
    placeholder?: string;
    options?: FilterOption[];
    defaultValue?: string;
}

interface DataFiltersProps {
    filters: FilterConfig[];
    values: Record<string, any>;
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
    onRefresh: () => void;
    className?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    loading?: boolean;
}

export function DataFilters({
    filters,
    values,
    onFilterChange,
    onClearFilters,
    onRefresh,
    className,
    showSearch = true,
    searchPlaceholder = "Rechercher...",
    searchValue = "",
    onSearchChange,
    loading = false,
}: DataFiltersProps) {
    const hasActiveFilters = Object.values(values).some(value =>
        value && value !== '' && value !== 'all'
    );

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Barre de recherche */}
                {showSearch && onSearchChange && (
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}

                {/* Filtres */}
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <div key={filter.key} className="flex items-center gap-2">
                            {filter.type === 'select' && (
                                <Select
                                    value={values[filter.key] || filter.defaultValue || 'all'}
                                    onValueChange={(value) => onFilterChange(filter.key, value)}
                                >
                                    <SelectTrigger className="w-auto min-w-[120px]">
                                        <SelectValue placeholder={filter.placeholder || filter.label} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous</SelectItem>
                                        {filter.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRefresh}
                        disabled={loading}
                        className="gap-2"
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        Actualiser
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="gap-2"
                        >
                            <X className="h-4 w-4" />
                            Effacer
                        </Button>
                    )}
                </div>
            </div>

            {/* Filtres actifs */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(values).map(([key, value]) => {
                        if (!value || value === '' || value === 'all') return null;

                        const filter = filters.find(f => f.key === key);
                        if (!filter) return null;

                        const label = filter.options?.find(opt => opt.value === value)?.label || value;

                        return (
                            <div
                                key={key}
                                className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                            >
                                <span className="font-medium">{filter.label}:</span>
                                <span>{label}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onFilterChange(key, filter.defaultValue || 'all')}
                                    className="h-auto p-0 ml-1 hover:bg-blue-100"
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// Composant de filtres simplifié pour les cas basiques
export function SimpleFilters({
    searchValue = "",
    onSearchChange,
    filters = [],
    values = {},
    onFilterChange,
    onClearFilters,
    className,
    loading = false,
}: {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    filters?: FilterConfig[];
    values?: Record<string, any>;
    onFilterChange?: (key: string, value: any) => void;
    onClearFilters?: () => void;
    className?: string;
    loading?: boolean;
}) {
    return (
        <div className={cn('flex items-center gap-4', className)}>
            {/* Recherche */}
            {onSearchChange && (
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Rechercher..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            )}

            {/* Filtres simples */}
            {filters.length > 0 && onFilterChange && (
                <div className="flex gap-2">
                    {filters.map((filter) => (
                        <Select
                            key={filter.key}
                            value={values[filter.key] || 'all'}
                            onValueChange={(value) => onFilterChange(filter.key, value)}
                        >
                            <SelectTrigger className="w-auto min-w-[120px]">
                                <SelectValue placeholder={filter.label} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                {filter.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ))}
                </div>
            )}

            {/* Bouton d'actualisation */}
            <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                disabled={loading}
                className="gap-2"
            >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Actualiser
            </Button>
        </div>
    );
} 