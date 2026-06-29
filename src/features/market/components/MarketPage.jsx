import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Store, Grid, List, Star, Zap, Palette, Image, MessageCircle, Type, Music, SlidersHorizontal, ChevronDown } from "lucide-react";
import { useMarket } from "../hooks/useMarket";
import MarketDetailModal from "./MarketDetailModal";
import { MarketGridCard, MarketListCard } from "./MarketCard";

const CATEGORY_ICONS = {
  all: Grid,
  themes: Palette,
  backgrounds: Image,
  bubbles: MessageCircle,
  fonts: Type,
  animations: Zap,
  sounds: Music,
};

export default function MarketPage() {
  const navigate = useNavigate();
  const {
    items, featured, categories, loading, error,
    activeCategory, sortBy, searchQuery, viewMode, sortOptions,
    setActiveCategory, setSortBy, setSearchQuery, setViewMode,
    installItem, uninstallItem, applyItem, rateItem,
  } = useMarket();

  const [selectedItem, setSelectedItem] = useState(null);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleInstallToggle = async (item) => {
    if (item.isInstalled) {
      await uninstallItem(item.id);
    } else {
      await installItem(item.id);
    }
  };

  const handleDetailInstall = async (item) => {
    await handleInstallToggle(item);
    setSelectedItem(null);
  };

  const handleDetailRate = async (rating) => {
    if (selectedItem) {
      await rateItem(selectedItem.id, rating);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0e14" }}>
        <div style={{ textAlign: "center" }}>
          <Store size={40} color="#565f89" style={{ marginBottom: 16 }} />
          <span style={{ color: "#565f89", fontSize: 14 }}>Cargando Orioneta Market...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0e14" }}>
      {/* Sidebar */}
      <div style={{ width: 260, flexShrink: 0, background: "#13141c", borderRight: "1px solid #1e2030", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #1e2030" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <button
              onClick={() => navigate("/chat")}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#1a1b26", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#565f89", flexShrink: 0,
              }}
              title="Volver al chat"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 style={{ color: "#c0caf5", fontSize: 18, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Store size={20} color="#a78bfa" />
              Market
            </h1>
          </div>
          <p style={{ color: "#565f89", fontSize: 12, margin: "4px 0 0 42px" }}>Personaliza tu experiencia</p>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e2030" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} color="#565f89" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                background: "#1a1b26",
                border: "1px solid #1e2030",
                borderRadius: 8,
                color: "#c0caf5",
                fontSize: 13,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#1e2030"; }}
            />
          </div>
        </div>

        {/* Categories */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 0" }}>
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Grid;
            const isActive = activeCategory === cat.id;
            const count = cat.id === "all" ? items.length + (featured?.length || 0)
              : items.filter(i => i.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  width: "100%",
                  padding: "10px 16px",
                  background: isActive ? "#7c3aed" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: isActive ? "white" : "#c0caf5",
                  fontSize: 13,
                  transition: "all 0.15s",
                  borderLeft: isActive ? "3px solid #a78bfa" : "3px solid transparent",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#1a1b26"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={16} color={isActive ? "white" : "#565f89"} />
                <span style={{ flex: 1, textAlign: "left" }}>{cat.label}</span>
                <span style={{ color: isActive ? "rgba(255,255,255,0.7)" : "#565f89", fontSize: 11 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Info Footer */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1e2030" }}>
          <p style={{ color: "#2d2f45", fontSize: 11, margin: 0, lineHeight: 1.4 }}>
            {items.length} ítems disponibles · {items.filter(i => i.isInstalled).length} instalados
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ padding: "24px 32px" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h2 style={{ color: "#c0caf5", fontSize: 22, fontWeight: 600, margin: "0 0 4px 0" }}>
                {categories.find(c => c.id === activeCategory)?.label || "Explorar"}
              </h2>
              <p style={{ color: "#565f89", fontSize: 13, margin: 0 }}>
                {searchQuery ? `Resultados para "${searchQuery}"` : "Descubre y personaliza tu interfaz"}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Sort */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    background: "#1a1b26",
                    border: "1px solid #1e2030",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "#c0caf5",
                    fontSize: 12,
                  }}
                >
                  <SlidersHorizontal size={14} color="#565f89" />
                  {sortOptions.find(o => o.value === sortBy)?.label || "Ordenar"}
                  <ChevronDown size={14} color="#565f89" />
                </button>

                {showSortDropdown && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: 0,
                      marginTop: 4,
                      background: "#1a1b26",
                      border: "1px solid #1e2030",
                      borderRadius: 8,
                      overflow: "hidden",
                      zIndex: 50,
                      minWidth: 180,
                    }}
                    onMouseLeave={() => setShowSortDropdown(false)}
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          background: sortBy === opt.value ? "#7c3aed" : "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "white",
                          fontSize: 13,
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                        onMouseEnter={(e) => { if (sortBy !== opt.value) e.currentTarget.style.background = "#13141c"; }}
                        onMouseLeave={(e) => { if (sortBy !== opt.value) e.currentTarget.style.background = "transparent"; }}
                      >
                        <Star size={14} color={sortBy === opt.value ? "#fbbf24" : "#565f89"} fill={sortBy === opt.value ? "#fbbf24" : "none"} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Mode */}
              <button
                onClick={() => setViewMode("grid")}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: viewMode === "grid" ? "#7c3aed" : "#1a1b26",
                  border: "1px solid #1e2030", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: viewMode === "grid" ? "white" : "#565f89",
                }}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: viewMode === "list" ? "#7c3aed" : "#1a1b26",
                  border: "1px solid #1e2030", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: viewMode === "list" ? "white" : "#565f89",
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Featured Section (only on "all" category) */}
          {activeCategory === "all" && !searchQuery && featured?.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ color: "#c0caf5", fontSize: 15, fontWeight: 600, margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: 6 }}>
                <Star size={16} color="#fbbf24" fill="#fbbf24" />
                Destacados
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
                {featured.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    style={{
                      background: "#13141c",
                      borderRadius: 10,
                      border: "1px solid #1e2030",
                      padding: 14,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#7c3aed"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e2030"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: item.preview?.primary || "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 16 }}>
                        <Palette size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: "#c0caf5", fontSize: 13, fontWeight: 600, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                        <p style={{ color: "#565f89", fontSize: 11, margin: "2px 0 0" }}>
                          <Star size={10} color="#fbbf24" fill="#fbbf24" style={{ display: "inline", verticalAlign: "middle", marginRight: 2 }} />
                          {item.ratingAverage}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {(item.tags || []).slice(0, 2).map(t => (
                        <span key={t} style={{ background: "#1a1b26", color: "#565f89", fontSize: 10, padding: "2px 6px", borderRadius: 4 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, marginBottom: 16 }}>
              <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Items */}
          {loading && items.length > 0 && (
            <div style={{ textAlign: "center", padding: 12 }}>
              <span style={{ color: "#565f89", fontSize: 13 }}>Actualizando...</span>
            </div>
          )}

          {!loading && items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 20px" }}>
              <Store size={48} color="#565f89" />
              <p style={{ color: "#565f89", fontSize: 15, margin: "16px 0 8px 0" }}>
                {searchQuery ? "No se encontraron resultados" : "No hay ítems disponibles"}
              </p>
              <p style={{ color: "#2d2f45", fontSize: 13, margin: 0 }}>
                {searchQuery ? "Intenta con otra búsqueda" : "Vuelve pronto para más contenido"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {items.map((item) => (
                <MarketGridCard
                  key={item.id}
                  item={item}
                  isInstalled={item.isInstalled}
                  onInstall={handleInstallToggle}
                  onSelect={setSelectedItem}
                />
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item) => (
                <MarketListCard
                  key={item.id}
                  item={item}
                  isInstalled={item.isInstalled}
                  onInstall={handleInstallToggle}
                  onSelect={setSelectedItem}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <MarketDetailModal
          item={selectedItem}
          isInstalled={selectedItem.isInstalled}
          onClose={() => setSelectedItem(null)}
          onInstall={handleDetailInstall}
          onRate={handleDetailRate}
        />
      )}
    </div>
  );
}
