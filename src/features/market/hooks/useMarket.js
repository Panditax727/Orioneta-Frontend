import { useState, useEffect, useCallback, useMemo } from "react";
import { marketService } from "../services/marketService";

const SORT_OPTIONS = [
  { value: "popular", label: "Populares" },
  { value: "rating", label: "Mejor valorados" },
  { value: "newest", label: "Más recientes" },
  { value: "downloads", label: "Más descargados" },
];

export function useMarket() {
  const [items, setItems] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const loadItems = useCallback(async (opts = {}) => {
    try {
      setLoading(true);
      setError(null);
      const category = opts.category ?? activeCategory;
      const sort = opts.sort ?? sortBy;
      const query = opts.query ?? searchQuery;

      const [allItems, featuredItems, cats] = await Promise.all([
        marketService.getItems({ category, sort, query }),
        marketService.getFeatured(),
        marketService.getCategories(),
      ]);

      setItems(allItems);
      setFeatured(featuredItems);
      setCategories(cats);
    } catch (err) {
      setError(err.message || "Error al cargar el market");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, sortBy, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadItems();
    }, 180);
    return () => clearTimeout(timer);
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    let result = items;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.tags || []).some(t => t.includes(q))
      );
    }

    return result;
  }, [items, searchQuery]);

  const handleInstall = useCallback(async (itemId) => {
    try {
      await marketService.installItem(itemId);
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isInstalled: true, downloads: item.downloads + 1 } : item
      ));
      setFeatured(prev => prev.map(item =>
        item.id === itemId ? { ...item, isInstalled: true, downloads: item.downloads + 1 } : item
      ));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const handleUninstall = useCallback(async (itemId) => {
    try {
      await marketService.uninstallItem(itemId);
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isInstalled: false } : item
      ));
      setFeatured(prev => prev.map(item =>
        item.id === itemId ? { ...item, isInstalled: false } : item
      ));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const handleApply = useCallback(async (itemId) => {
    try {
      await marketService.installItem(itemId);
      await marketService.applyToChat(itemId);
      setItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isInstalled: true, downloads: item.downloads + 1 } : item
      ));
      setFeatured(prev => prev.map(item =>
        item.id === itemId ? { ...item, isInstalled: true, downloads: item.downloads + 1 } : item
      ));
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const handleRate = useCallback(async (itemId, rating) => {
    try {
      await marketService.rateItem(itemId, rating);
      setItems(prev => prev.map(item => {
        if (item.id !== itemId) return item;
        const oldTotal = item.ratingAverage * item.ratingCount;
        const newCount = item.ratingCount + 1;
        const newAvg = Math.round(((oldTotal + rating) / newCount) * 10) / 10;
        return { ...item, ratingAverage: newAvg, ratingCount: newCount };
      }));
      return true;
    } catch (err) {
      console.error("Error al calificar:", err);
      throw err;
    }
  }, []);

  const changeCategory = useCallback((cat) => {
    setActiveCategory(cat);
    setSearchQuery("");
  }, []);

  return {
    items: filteredItems,
    featured,
    categories,
    loading,
    error,
    activeCategory,
    sortBy,
    searchQuery,
    viewMode,
    sortOptions: SORT_OPTIONS,
    setActiveCategory: changeCategory,
    setSortBy,
    setSearchQuery,
    setViewMode,
    installItem: handleInstall,
    uninstallItem: handleUninstall,
    applyItem: handleApply,
    rateItem: handleRate,
    refetch: loadItems,
  };
}
