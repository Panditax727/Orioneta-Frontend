import { useState } from "react";
import { Search, Download, Star, Check, Palette, Crown, Grid, List } from "lucide-react";
import { useThemes } from "../hooks/useThemes";

export default function ThemeMarket() {
  const { themes, installedTheme, loading, installTheme, uninstallTheme, rateTheme } = useThemes();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all, official, community, installed
  const [viewMode, setViewMode] = useState("grid"); // grid, list
  const [selectedTheme, setSelectedTheme] = useState(null);

  const filteredThemes = themes.filter(theme => {
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filter === "all" ||
      (filter === "official" && theme.isOfficial) ||
      (filter === "community" && !theme.isOfficial) ||
      (filter === "installed" && theme.isInstalled);
    return matchesSearch && matchesFilter;
  });

  const handleInstall = async (themeId) => {
    try {
      if (installedTheme?.id === themeId) {
        await uninstallTheme(themeId);
      } else {
        await installTheme(themeId);
      }
    } catch (err) {
      console.error("Error al instalar/desinstalar tema:", err);
    }
  };

  const handleRate = async (themeId, rating) => {
    try {
      await rateTheme(themeId, rating);
    } catch (err) {
      console.error("Error al calificar tema:", err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0d0e14" }}>
        <span style={{ color: "#565f89", fontSize: 14 }}>Cargando temas...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0d0e14" }}>
      {/* Sidebar */}
      <div style={{ width: 280, flexShrink: 0, background: "#13141c", borderRight: "1px solid #1e2030", padding: "20px" }}>
        <h1 style={{ color: "#c0caf5", fontSize: 20, fontWeight: 600, margin: "0 0 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <Palette size={24} />
          Theme Market
        </h1>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <Search 
            size={16} 
            color="#565f89" 
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Buscar temas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 36px",
              background: "#1a1b26",
              border: "1px solid #1e2030",
              borderRadius: 8,
              color: "#c0caf5",
              fontSize: 14,
              outline: "none",
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = "#7c3aed"}
            onBlur={(e) => e.currentTarget.style.borderColor = "#1e2030"}
          />
        </div>

        {/* Filters */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ color: "#c0caf5", fontSize: 13, fontWeight: 600, margin: "0 0 12px 0" }}>Filtros</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")} label="Todos" count={themes.length} />
            <FilterButton active={filter === "official"} onClick={() => setFilter("official")} label="Oficiales" count={themes.filter(t => t.isOfficial).length} icon={<Crown size={14} />} />
            <FilterButton active={filter === "community"} onClick={() => setFilter("community")} label="Comunidad" count={themes.filter(t => !t.isOfficial).length} />
            <FilterButton active={filter === "installed"} onClick={() => setFilter("installed")} label="Instalados" count={themes.filter(t => t.isInstalled).length} />
          </div>
        </div>

        {/* Installed Theme */}
        {installedTheme && (
          <div style={{ padding: 16, background: "#1a1b26", borderRadius: 8, border: "1px solid #1e2030" }}>
            <h3 style={{ color: "#c0caf5", fontSize: 13, fontWeight: 600, margin: "0 0 12px 0" }}>Tema actual</h3>
            <MiniThemeCard theme={installedTheme} onUninstall={() => handleInstall(installedTheme.id)} />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h2 style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, margin: "0 0 4px 0" }}>
              Explorar Temas
            </h2>
            <p style={{ color: "#565f89", fontSize: 14, margin: 0 }}>
              Personaliza tu interfaz con temas creados por la comunidad y el equipo de Orioneta
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: viewMode === "grid" ? "#7c3aed" : "#1a1b26",
                border: "1px solid #1e2030",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: viewMode === "grid" ? "white" : "#565f89",
              }}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: viewMode === "list" ? "#7c3aed" : "#1a1b26",
                border: "1px solid #1e2030",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: viewMode === "list" ? "white" : "#565f89",
              }}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Themes Grid */}
        {filteredThemes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <Palette size={48} color="#565f89" style={{ marginBottom: 16 }} />
            <p style={{ color: "#565f89", fontSize: 15, margin: "0 0 8px 0" }}>No se encontraron temas</p>
            <p style={{ color: "#2d2f45", fontSize: 13, margin: 0 }}>Intenta con otra búsqueda o filtro</p>
          </div>
        ) : viewMode === "grid" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isInstalled={installedTheme?.id === theme.id}
                onInstall={() => handleInstall(theme.id)}
                onSelect={() => setSelectedTheme(theme)}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredThemes.map((theme) => (
              <ThemeListItem
                key={theme.id}
                theme={theme}
                isInstalled={installedTheme?.id === theme.id}
                onInstall={() => handleInstall(theme.id)}
                onSelect={() => setSelectedTheme(theme)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Theme Detail Modal */}
      {selectedTheme && (
        <ThemeDetailModal
          theme={selectedTheme}
          isInstalled={installedTheme?.id === selectedTheme.id}
          onClose={() => setSelectedTheme(null)}
          onInstall={() => {
            handleInstall(selectedTheme.id);
            setSelectedTheme(null);
          }}
          onRate={(rating) => handleRate(selectedTheme.id, rating)}
        />
      )}
    </div>
  );
}

function FilterButton({ active, onClick, label, count, icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 6,
        background: active ? "#7c3aed" : "transparent",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: active ? "white" : "#c0caf5",
        fontSize: 13,
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "#1a1b26";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {icon}
        {label}
      </div>
      <span style={{ color: active ? "rgba(255,255,255,0.7)" : "#565f89", fontSize: 12 }}>{count}</span>
    </button>
  );
}

function ThemeCard({ theme, isInstalled, onInstall, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        background: "#13141c",
        borderRadius: 12,
        border: "1px solid #1e2030",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#7c3aed";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#1e2030";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Preview */}
      <div
        style={{
          height: 120,
          background: theme.preview.background,
          padding: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            background: theme.preview.primary,
          }}
        />
        <div>
          <div
            style={{
              width: 80,
              height: 8,
              borderRadius: 4,
              background: theme.preview.text,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              width: 120,
              height: 6,
              borderRadius: 3,
              background: theme.preview.border,
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <h3 style={{ color: "#c0caf5", fontSize: 15, fontWeight: 600, margin: 0, flex: 1 }}>
            {theme.name}
          </h3>
          {theme.isOfficial && <Crown size={14} color="#fbbf24" />}
        </div>
        <p style={{ color: "#565f89", fontSize: 12, margin: "0 0 12px 0", lineHeight: 1.4 }}>
          {theme.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <span style={{ color: "#c0caf5", fontSize: 13, fontWeight: 500 }}>{theme.rating}</span>
          </div>
          <span style={{ color: "#565f89", fontSize: 12 }}>{theme.downloads} descargas</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onInstall();
          }}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 8,
            background: isInstalled ? "#22c55e" : "#7c3aed",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {isInstalled ? <Check size={16} /> : <Download size={16} />}
          {isInstalled ? "Instalado" : "Instalar"}
        </button>
      </div>
    </div>
  );
}

function ThemeListItem({ theme, isInstalled, onInstall, onSelect }) {
  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: 16,
        background: "#13141c",
        borderRadius: 8,
        border: "1px solid #1e2030",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#7c3aed";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#1e2030";
      }}
    >
      {/* Preview */}
      <div
        style={{
          width: 80,
          height: 60,
          borderRadius: 8,
          background: theme.preview.background,
          padding: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            background: theme.preview.primary,
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <h3 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: 0 }}>
            {theme.name}
          </h3>
          {theme.isOfficial && <Crown size={12} color="#fbbf24" />}
        </div>
        <p style={{ color: "#565f89", fontSize: 12, margin: "0 0 8px 0" }}>{theme.description}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <span style={{ color: "#c0caf5", fontSize: 12 }}>{theme.rating}</span>
          </div>
          <span style={{ color: "#565f89", fontSize: 12 }}>{theme.downloads} descargas</span>
          <span style={{ color: "#565f89", fontSize: 12 }}>por {theme.author}</span>
        </div>
      </div>

      {/* Install Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onInstall();
        }}
        style={{
          padding: "8px 16px",
          borderRadius: 6,
          background: isInstalled ? "#22c55e" : "#7c3aed",
          border: "none",
          cursor: "pointer",
          color: "white",
          fontSize: 12,
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexShrink: 0,
        }}
      >
        {isInstalled ? <Check size={14} /> : <Download size={14} />}
        {isInstalled ? "Instalado" : "Instalar"}
      </button>
    </div>
  );
}

function MiniThemeCard({ theme, onUninstall }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          height: 60,
          borderRadius: 6,
          background: theme.preview.background,
          padding: 12,
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            background: theme.preview.primary,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: 60,
              height: 6,
              borderRadius: 3,
              background: theme.preview.text,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: theme.preview.border,
            }}
          />
        </div>
      </div>
      <h4 style={{ color: "#c0caf5", fontSize: 13, fontWeight: 600, margin: "0 0 8px 0" }}>{theme.name}</h4>
      <button
        onClick={onUninstall}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: 6,
          background: "transparent",
          border: "1px solid #1e2030",
          cursor: "pointer",
          color: "#c0caf5",
          fontSize: 12,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#1a1b26";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        Cambiar tema
      </button>
    </div>
  );
}

function ThemeDetailModal({ theme, isInstalled, onClose, onInstall, onRate }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.7)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#13141c",
          borderRadius: 16,
          border: "1px solid #1e2030",
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ padding: "24px 24px 0 24px" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#565f89",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <h2 style={{ color: "#c0caf5", fontSize: 20, fontWeight: 600, margin: 0, flex: 1 }}>
              {theme.name}
            </h2>
            {theme.isOfficial && <Crown size={20} color="#fbbf24" />}
          </div>

          {/* Large Preview */}
          <div
            style={{
              height: 180,
              borderRadius: 12,
              background: theme.preview.background,
              padding: 24,
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 12,
                background: theme.preview.primary,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  width: "100%",
                  height: 12,
                  borderRadius: 6,
                  background: theme.preview.text,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  width: "80%",
                  height: 8,
                  borderRadius: 4,
                  background: theme.preview.border,
                  marginBottom: 8,
                }}
              />
              <div
                style={{
                  width: "60%",
                  height: 8,
                  borderRadius: 4,
                  background: theme.preview.secondary,
                }}
              />
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, marginBottom: 20 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{theme.rating}</div>
              <div style={{ color: "#565f89", fontSize: 12 }}>Rating</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "#c0caf5", fontSize: 24, fontWeight: 600, marginBottom: 4 }}>{theme.downloads}</div>
              <div style={{ color: "#565f89", fontSize: 12 }}>Descargas</div>
            </div>
          </div>

          {/* Description */}
          <p style={{ color: "#c0caf5", fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
            {theme.description}
          </p>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 600 }}>
              {theme.author[0]}
            </div>
            <span style={{ color: "#c0caf5", fontSize: 14 }}>Creado por {theme.author}</span>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ color: "#c0caf5", fontSize: 14, fontWeight: 600, margin: "0 0 12px 0" }}>Calificar tema</h4>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => {
                    setRating(star);
                    onRate(star);
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <Star
                    size={24}
                    color={star <= (hoverRating || rating) ? "#fbbf24" : "#565f89"}
                    fill={star <= (hoverRating || rating) ? "#fbbf24" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Install Button */}
          <button
            onClick={onInstall}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: 8,
              background: isInstalled ? "#22c55e" : "#7c3aed",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {isInstalled ? <Check size={20} /> : <Download size={20} />}
            {isInstalled ? "Tema instalado" : "Instalar tema"}
          </button>
        </div>
      </div>
    </div>
  );
}
