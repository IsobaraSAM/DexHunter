import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Search, 
  Flame, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  SlidersHorizontal, 
  RefreshCw, 
  AlertTriangle, 
  Zap, 
  Info,
  Sun,
  Moon,
  Clock,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TokenPair } from "./types";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";

const CornerBrackets = () => (
  <>
    <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t border-l border-[#ff6b35]/60 pointer-events-none z-20"></div>
    <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t border-r border-[#ff6b35]/60 pointer-events-none z-20"></div>
    <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b border-l border-[#ff6b35]/60 pointer-events-none z-20"></div>
    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b border-r border-[#ff6b35]/60 pointer-events-none z-20"></div>
  </>
);

const TokenImage = ({ imageUrl, symbol }: { imageUrl?: string; symbol?: string }) => {
  const [imgError, setImgError] = useState(false);
  const firstLetter = symbol ? symbol.charAt(0).toUpperCase() : "?";

  if (!imageUrl || imgError) {
    return (
      <div 
        className="w-8 h-8 rounded-full bg-[#18181f] border border-[#ff6b35]/25 flex items-center justify-center font-mono text-xs font-bold text-[#ff6b35] flex-shrink-0" 
        title={symbol}
      >
        {firstLetter}
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={symbol || "Token Logo"}
      referrerPolicy="no-referrer"
      onError={() => setImgError(true)}
      className="w-8 h-8 rounded-full object-cover border border-[#ff6b35]/20 flex-shrink-0"
    />
  );
};

const ChainIcon = ({ chainId, fallbackClass }: { chainId: string; fallbackClass: string }) => {
  const [imgError, setImgError] = useState(false);
  const norm = chainId?.toLowerCase() || "";
  
  const cdnUrls: Record<string, string> = {
    solana: "https://dd.dexscreener.com/ds-data/chains/solana.png",
    bsc: "https://dd.dexscreener.com/ds-data/chains/bsc.png",
    ethereum: "https://dd.dexscreener.com/ds-data/chains/ethereum.png",
    ether: "https://dd.dexscreener.com/ds-data/chains/ethereum.png",
    base: "https://dd.dexscreener.com/ds-data/chains/base.png",
    arbitrum: "https://dd.dexscreener.com/ds-data/chains/arbitrum.png",
    cronos: "https://dd.dexscreener.com/ds-data/chains/cronos.png",
  };

  const logoUrl = cdnUrls[norm];

  if (!logoUrl || imgError) {
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-none ${fallbackClass}`}>
        {chainId?.toUpperCase() || "UNKNOWN"}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={chainId}
      title={chainId.toUpperCase()}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
      className="w-[18px] h-[18px] object-contain flex-shrink-0"
    />
  );
};

export default function App() {
  // Theme state configuration
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  // Modern design style pairs for dark/light theme configurations
  const theme = useMemo(() => {
    return {
      bgMain: isDarkMode ? "bg-[#121212] text-gray-100 instrument-grid" : "bg-[#fcfbf9] text-gray-900 instrument-grid-light",
      bgHeader: isDarkMode ? "bg-[#161616]/95 border-[#282828] text-white" : "bg-white/95 border-gray-300 text-gray-900 shadow-none",
      bgCard: isDarkMode ? "bg-[#181818]/90 border-[#2b2b2b]" : "bg-white border-gray-300 shadow-none",
      bgInner: isDarkMode ? "bg-[#131313] border-[#222222]" : "bg-[#f5f4ef] border-gray-250",
      bgTabs: isDarkMode ? "bg-[#151515] border-[#2a2a2a]" : "bg-[#efeee9] border-gray-300",
      textTitle: isDarkMode ? "text-gray-100" : "text-gray-900 font-semibold",
      textSub: isDarkMode ? "text-gray-400" : "text-gray-600",
      textMuted: isDarkMode ? "text-gray-500" : "text-gray-405",
      borderMain: isDarkMode ? "border-[#2b2b2b]" : "border-gray-300",
      btnSecondary: isDarkMode ? "bg-[#222222] hover:bg-[#2c2c2c] border-[#333333] text-gray-400 hover:text-white" : "bg-[#f5f4f0] hover:bg-[#ebeae5] border-gray-300 text-gray-700 hover:text-gray-900 shadow-none",
      inputStyle: isDarkMode 
        ? "bg-[#131313] border-[#2b2b2b] text-white placeholder-gray-600 focus:border-[#ff6b35] transition-all" 
        : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-[#ff6b35] transition-all"
    };
  }, [isDarkMode]);

  // Navigation
  const [activeTab, setActiveTab] = useState<"search" | "trending" | "latest">("search");
  
  // Pagination & Layout Responsiveness States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);
  const PAGE_SIZE = 100;
  
  // API Data
  const [searchQuery, setSearchQuery] = useState("moon");
  const [pairs, setPairs] = useState<TokenPair[]>([]);
  const [rawResults, setRawResults] = useState<TokenPair[]>([]);
  const [ageFilter, setAgeFilter] = useState<string>("all");
  const [trending, setTrending] = useState<any[]>([]);
  const [latestListings, setLatestListings] = useState<any[]>([]);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced Filters
  const [chain, setChain] = useState<string>("all");
  const [minVolume, setMinVolume] = useState<number | "">("");
  const [minLiquidity, setMinLiquidity] = useState<number | "">("");
  const [minMarketCap, setMinMarketCap] = useState<number | "">("");
  const [maxMarketCap, setMaxMarketCap] = useState<number | "">("");
  
  // Social Filters
  const [reqTelegram, setReqTelegram] = useState(false);
  const [reqTwitter, setReqTwitter] = useState(false);
  const [reqWebsite, setReqWebsite] = useState(false);
  
  // Sorting Mode
  const [sortBy, setSortBy] = useState<"volume" | "liquidity" | "priceChange" | "marketCap" | "newest" | "none">("volume");
  
  // Feedback state for clipboard copying
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Quick Preset tags
  const quickSearchTags = ["sol", "base", "meme", "pepe", "ai", "dog", "elon", "pump"];

  // Clipboard Copier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => {
      setCopiedAddress(null);
    }, 2000);
  };

  // 1. Fetch Search pairs
  const fetchSearchPairs = useCallback(async (queryStr: string) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(queryStr)}`);
      if (!response.ok) throw new Error("DexScreener API returned an error rating");
      const data = await response.json();
      const rawPairs = data.pairs || [];
      const validPairs = rawPairs.filter((p: TokenPair) => p.liquidity?.usd);
      setPairs(validPairs);
      setRawResults(validPairs);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err?.message || "Something went wrong while searching.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch Trending Boosts
  const fetchTrendingBoosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.dexscreener.com/token-boosts/top/v1");
      if (!response.ok) throw new Error("Failed to load trending boosts");
      const data = await response.json();
      
      const boosts = Array.isArray(data) ? data : [];
      setTrending(boosts);

      // Support paging of up to 90 boosted projects in batches of 30
      const topAddresses = boosts.slice(0, 90).map(b => b.tokenAddress);
      if (topAddresses.length > 0) {
        const batchSize = 30;
        const batches: string[][] = [];
        for (let i = 0; i < topAddresses.length; i += batchSize) {
          batches.push(topAddresses.slice(i, i + batchSize));
        }

        const enrichedPairs: TokenPair[] = [];
        await Promise.all(
          batches.map(async (batch) => {
            try {
              const csvAddresses = batch.join(",");
              const pairRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${csvAddresses}`);
              if (pairRes.ok) {
                const pairData = await pairRes.json();
                if (pairData.pairs && pairData.pairs.length > 0) {
                  // Keep primary highest-liquidity pair per token address
                  const tokenPairsMap = new Map<string, TokenPair>();
                  for (const pair of pairData.pairs) {
                    const tokenAddr = pair.baseToken?.address;
                    if (tokenAddr) {
                      const existing = tokenPairsMap.get(tokenAddr);
                      if (!existing || Number(pair.liquidity?.usd || 0) > Number(existing.liquidity?.usd || 0)) {
                        tokenPairsMap.set(tokenAddr, pair);
                      }
                    }
                  }
                  enrichedPairs.push(...Array.from(tokenPairsMap.values()));
                }
              }
            } catch (e) {
              console.error("Enrichment batch error", e);
            }
          })
        );

        if (enrichedPairs.length > 0) {
          // Put back in of the original ranking order
          const addressOrder = new Map(topAddresses.map((addr, idx) => [addr.toLowerCase(), idx]));
          enrichedPairs.sort((a, b) => {
            const indexA = addressOrder.get(a.baseToken?.address?.toLowerCase() || "") ?? 999;
            const indexB = addressOrder.get(b.baseToken?.address?.toLowerCase() || "") ?? 999;
            return indexA - indexB;
          });
          const validPairs = enrichedPairs.filter((p: TokenPair) => p.liquidity?.usd);
          setPairs(validPairs);
          setRawResults(validPairs);
          setCurrentPage(1);
        } else {
          setPairs([]);
          setRawResults([]);
        }
      } else {
        setPairs([]);
        setRawResults([]);
      }
    } catch (err: any) {
      setError(err?.message || "Could not retrieve trending boosts.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Fetch Latest Listings
  const fetchLatestListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("https://api.dexscreener.com/token-profiles/latest/v1");
      if (!response.ok) throw new Error("Failed to load latest profiles");
      const data = await response.json();
      
      const profiles = Array.isArray(data) ? data : [];
      setLatestListings(profiles);

      // Support paging of up to 90 latest projects in batches of 30
      const topAddresses = profiles.slice(0, 90).map(p => p.tokenAddress);
      if (topAddresses.length > 0) {
        const batchSize = 30;
        const batches: string[][] = [];
        for (let i = 0; i < topAddresses.length; i += batchSize) {
          batches.push(topAddresses.slice(i, i + batchSize));
        }

        const enrichedPairs: TokenPair[] = [];
        await Promise.all(
          batches.map(async (batch) => {
            try {
              const csvAddresses = batch.join(",");
              const pairRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${csvAddresses}`);
              if (pairRes.ok) {
                const pairData = await pairRes.json();
                if (pairData.pairs && pairData.pairs.length > 0) {
                  // Keep primary highest-liquidity pair per token address
                  const tokenPairsMap = new Map<string, TokenPair>();
                  for (const pair of pairData.pairs) {
                    const tokenAddr = pair.baseToken?.address;
                    if (tokenAddr) {
                      const existing = tokenPairsMap.get(tokenAddr);
                      if (!existing || Number(pair.liquidity?.usd || 0) > Number(existing.liquidity?.usd || 0)) {
                        tokenPairsMap.set(tokenAddr, pair);
                      }
                    }
                  }
                  enrichedPairs.push(...Array.from(tokenPairsMap.values()));
                }
              }
            } catch (e) {
              console.error("Enrichment batch error", e);
            }
          })
        );

        if (enrichedPairs.length > 0) {
          // Put back in of the original ranking order
          const addressOrder = new Map(topAddresses.map((addr, idx) => [addr.toLowerCase(), idx]));
          enrichedPairs.sort((a, b) => {
            const indexA = addressOrder.get(a.baseToken?.address?.toLowerCase() || "") ?? 999;
            const indexB = addressOrder.get(b.baseToken?.address?.toLowerCase() || "") ?? 999;
            return indexA - indexB;
          });
          const validPairs = enrichedPairs.filter((p: TokenPair) => p.liquidity?.usd);
          setPairs(validPairs);
          setRawResults(validPairs);
          setCurrentPage(1);
        } else {
          setPairs([]);
          setRawResults([]);
        }
      } else {
        setPairs([]);
        setRawResults([]);
      }
    } catch (err: any) {
      setError(err?.message || "Could not retrieve latest profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Set action on Tab Click & Reset Page
  useEffect(() => {
    setCurrentPage(1);
    if (activeTab === "search") {
      fetchSearchPairs(searchQuery);
    } else if (activeTab === "trending") {
      fetchTrendingBoosts();
    } else if (activeTab === "latest") {
      fetchLatestListings();
    }
  }, [activeTab, fetchSearchPairs, fetchTrendingBoosts, fetchLatestListings]);

  // Reset currentPage when filters or query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [chain, minVolume, minLiquidity, minMarketCap, maxMarketCap, reqTelegram, reqTwitter, reqWebsite, sortBy, searchQuery, ageFilter]);

  // Handle Search Input Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab !== "search") {
      setActiveTab("search");
    }
    fetchSearchPairs(searchQuery);
  };

  // Active Preset state tracker mapped dynamically based on selected filters
  const activePreset = useMemo<"bluechip" | "solgems" | "microcaps" | "base-moonshots" | "high-volume" | "custom">(() => {
    if (
      chain === "all" &&
      minVolume === 500000 &&
      minLiquidity === 100000 &&
      minMarketCap === 5000000 &&
      maxMarketCap === "" &&
      !reqTelegram &&
      !reqTwitter &&
      !reqWebsite &&
      ageFilter === "all" &&
      sortBy === "liquidity"
    ) {
      return "bluechip";
    }
    if (
      chain === "solana" &&
      minVolume === 100000 &&
      minLiquidity === 20000 &&
      minMarketCap === "" &&
      maxMarketCap === "" &&
      reqTelegram &&
      reqTwitter &&
      reqWebsite &&
      ageFilter === "all" &&
      sortBy === "volume"
    ) {
      return "solgems";
    }
    if (
      chain === "all" &&
      minVolume === "" &&
      minLiquidity === 5000 &&
      minMarketCap === 10000 &&
      maxMarketCap === 500000 &&
      reqTelegram &&
      reqTwitter &&
      !reqWebsite &&
      ageFilter === "all" &&
      sortBy === "priceChange"
    ) {
      return "microcaps";
    }
    if (
      chain === "base" &&
      minVolume === 50000 &&
      minLiquidity === 10000 &&
      minMarketCap === 10000 &&
      maxMarketCap === 1000000 &&
      reqTelegram &&
      reqTwitter &&
      !reqWebsite &&
      ageFilter === "all" &&
      sortBy === "priceChange"
    ) {
      return "base-moonshots";
    }
    if (
      chain === "all" &&
      minVolume === 1000000 &&
      minLiquidity === 50000 &&
      minMarketCap === 1000000 &&
      maxMarketCap === "" &&
      !reqTelegram &&
      !reqTwitter &&
      !reqWebsite &&
      ageFilter === "all" &&
      sortBy === "volume"
    ) {
      return "high-volume";
    }
    return "custom";
  }, [chain, minVolume, minLiquidity, minMarketCap, maxMarketCap, reqTelegram, reqTwitter, reqWebsite, sortBy, ageFilter]);

  // Apply Quick Preset Filters
  const applyPreset = (presetType: "bluechip" | "solgems" | "microcaps" | "base-moonshots" | "high-volume") => {
    if (presetType === "bluechip") {
      setChain("all");
      setMinVolume(500000);
      setMinLiquidity(100000);
      setMinMarketCap(5000000);
      setMaxMarketCap("");
      setReqTelegram(false);
      setReqTwitter(false);
      setReqWebsite(false);
      setAgeFilter("all");
      setSortBy("liquidity");
    } else if (presetType === "solgems") {
      setChain("solana");
      setMinVolume(100000);
      setMinLiquidity(20000);
      setMinMarketCap("");
      setMaxMarketCap("");
      setReqTelegram(true);
      setReqTwitter(true);
      setReqWebsite(true);
      setAgeFilter("all");
      setSortBy("volume");
    } else if (presetType === "microcaps") {
      setChain("all");
      setMinVolume("");
      setMinLiquidity(5000);
      setMinMarketCap(10000);
      setMaxMarketCap(500000);
      setReqTelegram(true);
      setReqTwitter(true);
      setReqWebsite(false);
      setAgeFilter("all");
      setSortBy("priceChange");
    } else if (presetType === "base-moonshots") {
      setChain("base");
      setMinVolume(50000);
      setMinLiquidity(10000);
      setMinMarketCap(10000);
      setMaxMarketCap(1000000);
      setReqTelegram(true);
      setReqTwitter(true);
      setReqWebsite(false);
      setAgeFilter("all");
      setSortBy("priceChange");
    } else if (presetType === "high-volume") {
      setChain("all");
      setMinVolume(1000000);
      setMinLiquidity(50000);
      setMinMarketCap(1000000);
      setMaxMarketCap("");
      setReqTelegram(false);
      setReqTwitter(false);
      setReqWebsite(false);
      setAgeFilter("all");
      setSortBy("volume");
    }
  };

  // Reset Filters to default
  const resetFilters = () => {
    setChain("all");
    setMinVolume("");
    setMinLiquidity("");
    setMinMarketCap("");
    setMaxMarketCap("");
    setReqTelegram(false);
    setReqTwitter(false);
    setReqWebsite(false);
    setAgeFilter("all");
    setSortBy("volume");
    setCurrentPage(1);
  };

  // Export to CSV helper
  const handleExportToCSV = () => {
    if (filteredAndSortedPairs.length === 0) return;
    
    // Define CSV headers
    const headers = [
      "Symbol",
      "Name",
      "Chain",
      "Price USD",
      "Market Cap USD",
      "Liquidity USD",
      "Volume 24H USD",
      "Price Change 24H %",
      "Token Address",
      "DexScreener URL",
      "Created At"
    ];
    
    // Format rows
    const rows = filteredAndSortedPairs.map(pair => {
      return [
        pair.baseToken?.symbol || "N/A",
        pair.baseToken?.name || "N/A",
        pair.chainId || "N/A",
        pair.priceUsd ? `$${pair.priceUsd}` : "0",
        pair.fdv || pair.marketCap || "0",
        pair.liquidity?.usd || "0",
        pair.volume?.h24 || "0",
        pair.priceChange?.h24 || "0",
        pair.baseToken?.address || "N/A",
        pair.url || "N/A",
        pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : "N/A"
      ];
    });
    
    // Build CSV payload safely escaping double quotes
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(value => {
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      }).join(","))
    ].join("\n");
    
    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dexhunter_${activeTab}_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process and Filter Pair Data loaded from API
  const filteredAndSortedPairs = useMemo(() => {
    if (!rawResults || rawResults.length === 0) return [];

    // Filter out liquidity-wiped tokens defensively
    let result = rawResults.filter(p => p.liquidity?.usd);

    // 1. Chain Filter
    if (chain !== "all") {
      result = result.filter(p => p.chainId?.toLowerCase() === chain.toLowerCase());
    }

    // 2. Volume Filters
    if (minVolume !== "") {
      result = result.filter(p => Number(p.volume?.h24 || 0) >= minVolume);
    }

    // 3. Liquidity Filters
    if (minLiquidity !== "") {
      result = result.filter(p => Number(p.liquidity?.usd || 0) >= minLiquidity);
    }

    // 4. Market Cap Filters
    if (minMarketCap !== "") {
      result = result.filter(p => Number(p.marketCap || p.fdv || 0) >= minMarketCap);
    }
    if (maxMarketCap !== "") {
      result = result.filter(p => Number(p.marketCap || p.fdv || 0) <= maxMarketCap);
    }

    // 5. Social Presence Filters
    if (reqTelegram) {
      result = result.filter(p => p.info?.socials?.some(s => s.type === "telegram"));
    }
    if (reqTwitter) {
      result = result.filter(p => p.info?.socials?.some(s => s.type === "twitter"));
    }
    if (reqWebsite) {
      result = result.filter(p => p.info?.websites && p.info.websites.length > 0);
    }

    // 6. Age Filters (defensive against missing timestamps, default passes)
    if (ageFilter !== "all") {
      result = result.filter(p => {
        if (!p.pairCreatedAt) return true;
        const ageMs = Date.now() - p.pairCreatedAt;
        if (ageFilter === "1h") return ageMs <= 60 * 60 * 1000;
        if (ageFilter === "6h") return ageMs <= 6 * 60 * 60 * 1000;
        if (ageFilter === "24h") return ageMs <= 24 * 60 * 60 * 1000;
        if (ageFilter === "1w") return ageMs <= 7 * 24 * 60 * 60 * 1000;
        if (ageFilter === "1m") return ageMs <= 30 * 24 * 60 * 60 * 1000;
        return true;
      });
    }

    // 7. Sorting Logic
    if (sortBy === "volume") {
      result.sort((a, b) => Number(b.volume?.h24 || 0) - Number(a.volume?.h24 || 0));
    } else if (sortBy === "liquidity") {
      result.sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0));
    } else if (sortBy === "priceChange") {
      result.sort((a, b) => Number(b.priceChange?.h24 || 0) - Number(a.priceChange?.h24 || 0));
    } else if (sortBy === "marketCap") {
      result.sort((a, b) => Number(b.marketCap || b.fdv || 0) - Number(a.marketCap || a.fdv || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => Number(b.pairCreatedAt || 0) - Number(a.pairCreatedAt || 0));
    }

    return result;
  }, [rawResults, chain, minVolume, minLiquidity, minMarketCap, maxMarketCap, reqTelegram, reqTwitter, reqWebsite, sortBy, ageFilter]);

  // Pagination Calculations
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedPairs.length / PAGE_SIZE);
  }, [filteredAndSortedPairs.length]);

  const paginatedPairs = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    // Cap or slice safely
    return filteredAndSortedPairs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredAndSortedPairs, currentPage]);

  // Background gradient and accent badges mapping based on chain
  const getChainBadgeStyle = (chainId: string) => {
    const norm = chainId?.toLowerCase();
    if (norm === "solana") return { bg: "bg-[#1c122c] text-[#a180e6] border-[#3e2c5d]", text: "SOLANA" };
    if (norm === "base") return { bg: "bg-[#101c30] text-[#5586f2] border-[#223963]", text: "BASE" };
    if (norm === "bsc") return { bg: "bg-[#201c10] text-[#f0b90b] border-[#443818]", text: "BSC" };
    if (norm === "ethereum" || norm === "ether") return { bg: "bg-[#102420] text-[#6ebd80] border-[#1f423b]", text: "ETHEREUM" };
    return { bg: "bg-[#181818] text-gray-400 border-[#2a2a2a]", text: chainId?.toUpperCase() || "UNKNOWN" };
  };

  // Helper to format creation elapsed times beautifully
  const formatTimeAgo = (timestampMs?: number) => {
    if (!timestampMs) return null;
    const diffMs = Date.now() - timestampMs;
    // Handle future times due to local clock syncs
    if (diffMs <= 0) return "Just now";
    
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) {
      const remainingMin = diffMin % 60;
      return `${diffHr}h ${remainingMin}m ago`;
    }
    
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 30) {
      const remainingHr = diffHr % 24;
      return `${diffDay}d ${remainingHr}h ago`;
    }
    
    const dateObj = new Date(timestampMs);
    return dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Construct historical price points based on current price and known rate shifts over 24h
  const generatePriceHistory = (pair: TokenPair) => {
    const currentPrice = Number(pair.priceUsd) || 0;
    const h24 = pair.priceChange?.h24 || 0;
    const h6 = pair.priceChange?.h6 || 0;
    const h1 = pair.priceChange?.h1 || 0;
    const m5 = pair.priceChange?.m5 || 0;

    const p0 = currentPrice;
    const p5m = m5 ? currentPrice / (1 + m5 / 100) : currentPrice;
    const p1h = h1 ? currentPrice / (1 + h1 / 100) : p5m;
    const p6h = h6 ? currentPrice / (1 + h6 / 100) : p1h;
    const p24h = h24 ? currentPrice / (1 + h24 / 100) : p6h;

    // Use token address + symbol to create stability without re-render flicker
    const seedString = `${pair.baseToken?.symbol || ""}-${pair.baseToken?.address || ""}`;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed + seedString.charCodeAt(i)) % 997;
    }
    const getFluctuation = (step: number, range: number) => {
      const val = Math.sin(seed + step * 2.3) * Math.cos(seed - step * 1.7);
      return val * range;
    };

    const points = [
      { time: "24h ago", price: p24h },
      { time: "20h ago", price: p24h + (p6h - p24h) * 0.16 + getFluctuation(1, (p6h || p24h) * 0.02) },
      { time: "16h ago", price: p24h + (p6h - p24h) * 0.33 + getFluctuation(2, (p6h || p24h) * 0.02) },
      { time: "12h ago", price: p24h + (p6h - p24h) * 0.50 + getFluctuation(3, (p6h || p24h) * 0.02) },
      { time: "8h ago", price: p24h + (p6h - p24h) * 0.75 + getFluctuation(4, (p6h || p24h) * 0.02) },
      { time: "6h ago", price: p6h },
      { time: "4h ago", price: p6h + (p1h - p6h) * 0.33 + getFluctuation(5, (p6h || p1h) * 0.01) },
      { time: "2h ago", price: p1h + (p6h - p1h) * 0.33 + getFluctuation(6, (p6h || p1h) * 0.01) },
      { time: "1h ago", price: p1h },
      { time: "30m ago", price: p1h + (p5m - p1h) * 0.50 + getFluctuation(7, (p1h || p5m) * 0.005) },
      { time: "5m ago", price: p5m },
      { time: "Now", price: p0 }
    ];

    return points.map(pt => ({
      ...pt,
      price: Math.max(0, pt.price)
    }));
  };

  // Dynamically Generated Single File netlify deployment layout to copy
  const singleFileHtmlCode = "";
  const ignoredHtml = `<!DOCTYPE html>
<html lang="en" style="background-color: #08090d;">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DEXHUNTER | Premium Crypto Token Discovery Dashboard</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <!-- Tailwind Play CDN for CSS v3 styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                        display: ['Space Grotesk', 'sans-serif'],
                        mono: ['JetBrains Mono', 'monospace'],
                    },
                    colors: {
                        darkBg: '#08090d',
                        slateCard: '#0f111a',
                        cyberGreen: '#10b981',
                        cyberRed: '#ef4444',
                    }
                }
            }
        }
    </script>
    <!-- React & ReactDOM -->
    <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
    <!-- Babel for browser-level JSX compiling -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body {
            background-color: #08090d;
            font-family: 'Inter', sans-serif;
            color: #f3f4f6;
        }
        /* Custom scrollbar to match dark cosmetic premium dashboard */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: #08090d;
        }
        ::-webkit-scrollbar-thumb {
            background: #1f2937;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #374151;
        }
    </style>
</head>
<body style="background-color: #08090d; min-height: 100vh;">
    <div id="root"></div>

    <script type="text/babel">
        // Destructure globals
        const { useState, useEffect, useMemo, useCallback } = React;

        // Inline minimal Icons to maintain zero dependencies
        const SearchIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        );
        const FlameIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
        );
        const SparklesIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>
        );
        const CopyIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        );
        const CheckIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polyline points="20 6 9 17 4 12"></polyline></svg>
        );
        const GlobeIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
        );
        const ExternalIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        );

        function App() {
            const [activeTab, setActiveTab] = useState("search");
            const [searchQuery, setSearchQuery] = useState("moon");
            const [pairs, setPairs] = useState([]);
            const [loading, setLoading] = useState(false);
            const [error, setError] = useState(null);
            const [copiedAddress, setCopiedAddress] = useState(null);

            // Filter States
            const [chain, setChain] = useState("all");
            const [minVolume, setMinVolume] = useState("");
            const [minLiquidity, setMinLiquidity] = useState("");
            const [minMarketCap, setMinMarketCap] = useState("");
            const [maxMarketCap, setMaxMarketCap] = useState("");
            const [reqTelegram, setReqTelegram] = useState(false);
            const [reqTwitter, setReqTwitter] = useState(false);
            const [reqWebsite, setReqWebsite] = useState(false);
            const [sortBy, setSortBy] = useState("volume");

            const quickTags = ["sol", "base", "meme", "pepe", "ai", "dog"];

            const fetchSearchPairs = useCallback(async (queryStr) => {
                if (!queryStr.trim()) return;
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch(\`https://api.dexscreener.com/latest/dex/search?q=\${encodeURIComponent(queryStr)}\`);
                    if (!response.ok) throw new Error("DexScreener API error rating");
                    const data = await response.json();
                    setPairs(data.pairs || []);
                } catch (err) {
                    setError(err.message || "Failed to load data.");
                } finally {
                    setLoading(false);
                }
            }, []);

            const fetchTrendingBoosts = useCallback(async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch("https://api.dexscreener.com/token-boosts/top/v1");
                    if (!response.ok) throw new Error("Failed to load trending boosts");
                    const boosts = await response.json();
                    
                    const addresses = (Array.isArray(boosts) ? boosts : []).slice(0, 8).map(b => b.tokenAddress);
                    const enriched = [];
                    for (const add of addresses) {
                        try {
                            const pairRes = await fetch(\`https://api.dexscreener.com/latest/dex/tokens/\${add}\`);
                            if (pairRes.ok) {
                                const d = await pairRes.json();
                                if (d.pairs && d.pairs.length > 0) enriched.push(d.pairs[0]);
                            }
                        } catch(e) {}
                    }
                    setPairs(enriched);
                } catch (err) {
                    setError(err.message || "Failed to load boosts.");
                } finally {
                    setLoading(false);
                }
            }, []);

            const fetchLatestListings = useCallback(async () => {
                setLoading(true);
                setError(null);
                try {
                    const response = await fetch("https://api.dexscreener.com/token-profiles/latest/v1");
                    if (!response.ok) throw new Error("Failed to load latest profiles");
                    const profiles = await response.json();
                    
                    const addresses = (Array.isArray(profiles) ? profiles : []).slice(0, 8).map(p => p.tokenAddress);
                    const enriched = [];
                    for (const add of addresses) {
                        try {
                            const pairRes = await fetch(\`https://api.dexscreener.com/latest/dex/tokens/\${add}\`);
                            if (pairRes.ok) {
                                const d = await pairRes.json();
                                if (d.pairs && d.pairs.length > 0) enriched.push(d.pairs[0]);
                            }
                        } catch(e) {}
                    }
                    setPairs(enriched);
                } catch (err) {
                    setError(err.message || "Failed to load latest.");
                } finally {
                    setLoading(false);
                }
            }, []);

            useEffect(() => {
                if (activeTab === "search") {
                    fetchSearchPairs(searchQuery);
                } else if (activeTab === "trending") {
                    fetchTrendingBoosts();
                } else if (activeTab === "latest") {
                    fetchLatestListings();
                }
            }, [activeTab, fetchSearchPairs, fetchTrendingBoosts, fetchLatestListings]);

            const copyToClipboard = (text) => {
                navigator.clipboard.writeText(text);
                setCopiedAddress(text);
                setTimeout(() => setCopiedAddress(null), 2000);
            };

            const activePreset = useMemo(() => {
                if (
                    chain === "all" &&
                    minVolume === 500000 &&
                    minLiquidity === 100000 &&
                    minMarketCap === 5000000 &&
                    maxMarketCap === "" &&
                    !reqTelegram &&
                    !reqTwitter &&
                    !reqWebsite &&
                    sortBy === "liquidity"
                ) {
                    return "bluechip";
                }
                if (
                    chain === "solana" &&
                    minVolume === 100000 &&
                    minLiquidity === 20000 &&
                    minMarketCap === "" &&
                    maxMarketCap === "" &&
                    reqTelegram &&
                    reqTwitter &&
                    reqWebsite &&
                    sortBy === "volume"
                ) {
                    return "solgems";
                }
                if (
                    chain === "all" &&
                    minVolume === "" &&
                    minLiquidity === 5000 &&
                    minMarketCap === 10000 &&
                    maxMarketCap === 500000 &&
                    reqTelegram &&
                    reqTwitter &&
                    !reqWebsite &&
                    sortBy === "priceChange"
                ) {
                    return "microcaps";
                }
                if (
                    chain === "base" &&
                    minVolume === 50000 &&
                    minLiquidity === 10000 &&
                    minMarketCap === 10000 &&
                    maxMarketCap === 1000000 &&
                    reqTelegram &&
                    reqTwitter &&
                    !reqWebsite &&
                    sortBy === "priceChange"
                ) {
                    return "base-moonshots";
                }
                if (
                    chain === "all" &&
                    minVolume === 1000000 &&
                    minLiquidity === 50000 &&
                    minMarketCap === 1000000 &&
                    maxMarketCap === "" &&
                    !reqTelegram &&
                    !reqTwitter &&
                    !reqWebsite &&
                    sortBy === "volume"
                ) {
                    return "high-volume";
                }
                return "custom";
            }, [chain, minVolume, minLiquidity, minMarketCap, maxMarketCap, reqTelegram, reqTwitter, reqWebsite, sortBy]);

            const applyPreset = (type) => {
                if (type === 'bluechip') {
                    setChain("all");
                    setMinVolume(500000);
                    setMinLiquidity(100000);
                    setMinMarketCap(5000000);
                    setMaxMarketCap("");
                    setReqTelegram(false);
                    setReqTwitter(false);
                    setReqWebsite(false);
                    setSortBy("liquidity");
                } else if (type === 'solgems') {
                    setChain("solana");
                    setMinVolume(100000);
                    setMinLiquidity(20000);
                    setMinMarketCap("");
                    setMaxMarketCap("");
                    setReqTelegram(true);
                    setReqTwitter(true);
                    setReqWebsite(true);
                    setSortBy("volume");
                } else if (type === 'microcaps') {
                    setChain("all");
                    setMinVolume("");
                    setMinLiquidity(5000);
                    setMinMarketCap(10000);
                    setMaxMarketCap(500000);
                    setReqTelegram(true);
                    setReqTwitter(true);
                    setReqWebsite(false);
                    setSortBy("priceChange");
                } else if (type === 'base-moonshots') {
                    setChain("base");
                    setMinVolume(50000);
                    setMinLiquidity(10000);
                    setMinMarketCap(10000);
                    setMaxMarketCap(1000000);
                    setReqTelegram(true);
                    setReqTwitter(true);
                    setReqWebsite(false);
                    setSortBy("priceChange");
                } else if (type === 'high-volume') {
                    setChain("all");
                    setMinVolume(1000000);
                    setMinLiquidity(50000);
                    setMinMarketCap(1000000);
                    setMaxMarketCap("");
                    setReqTelegram(false);
                    setReqTwitter(false);
                    setReqWebsite(false);
                    setSortBy("volume");
                }
            };

            const filteredPairs = useMemo(() => {
                if (!pairs) return [];
                let res = [...pairs];
                if (chain !== "all") {
                    res = res.filter(p => p.chainId?.toLowerCase() === chain.toLowerCase());
                }
                if (minVolume) {
                    res = res.filter(p => Number(p.volume?.h24 || 0) >= Number(minVolume));
                }
                if (minLiquidity) {
                    res = res.filter(p => Number(p.liquidity?.usd || 0) >= Number(minLiquidity));
                }
                if (minMarketCap) {
                    res = res.filter(p => Number(p.marketCap || p.fdv || 0) >= Number(minMarketCap));
                }
                if (maxMarketCap) {
                    res = res.filter(p => Number(p.marketCap || p.fdv || 0) <= Number(maxMarketCap));
                }
                if (reqTelegram) {
                    res = res.filter(p => p.info?.socials?.some(s => s.type === "telegram"));
                }
                if (reqTwitter) {
                    res = res.filter(p => p.info?.socials?.some(s => s.type === "twitter"));
                }
                if (reqWebsite) {
                    res = res.filter(p => p.info?.websites && p.info.websites.length > 0);
                }

                if (sortBy === "volume") {
                    res.sort((a,b) => Number(b.volume?.h24 || 0) - Number(a.volume?.h24 || 0));
                } else if (sortBy === "liquidity") {
                    res.sort((a,b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0));
                } else if (sortBy === "marketCap") {
                    res.sort((a,b) => Number(b.marketCap || b.fdv || 0) - Number(a.marketCap || a.fdv || 0));
                }
                return res;
            }, [pairs, chain, minVolume, minLiquidity, minMarketCap, maxMarketCap, reqTelegram, reqTwitter, reqWebsite, sortBy]);

            const getChainStyle = (chainId) => {
                const norm = chainId?.toLowerCase();
                if (norm === "solana") return "bg-purple-900/30 text-purple-400 border-purple-500/30";
                if (norm === "base") return "bg-blue-900/30 text-blue-400 border-blue-500/30";
                if (norm === "bsc") return "bg-amber-900/30 text-amber-400 border-amber-500/30";
                return "bg-gray-800/40 text-gray-400 border-gray-600/30";
            };

            return (
                <div className="min-h-screen flex flex-col font-sans">
                    {/* Header */}
                    <header className="border-b border-gray-800 bg-[#0c0e17] px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-display font-semibold text-lg text-white shadow-lg shadow-cyan-500/10">
                                DH
                            </div>
                            <div>
                                <h1 className="font-display text-xl font-bold tracking-tight text-white m-0">DEXHUNTER</h1>
                                <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">Core Discovery Protocol</p>
                            </div>
                        </div>
                        <div className="flex bg-[#111422] rounded-lg p-0.5 border border-gray-800 text-sm">
                            <button onClick={() => setActiveTab("search")} className={\`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 \${activeTab === "search" ? "bg-cyan-600 text-white shadow" : "text-gray-400 hover:text-white"}\`}>
                                <SearchIcon /> Search
                            </button>
                            <button onClick={() => setActiveTab("trending")} className={\`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 \${activeTab === "trending" ? "bg-cyan-600 text-white shadow" : "text-gray-400 hover:text-white"}\`}>
                                <FlameIcon /> Trending Alerts
                            </button>
                            <button onClick={() => setActiveTab("latest")} className={\`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 \${activeTab === "latest" ? "bg-cyan-600 text-white shadow" : "text-gray-400 hover:text-white"}\`}>
                                <SparklesIcon /> Latest listings
                            </button>
                        </div>
                    </header>

                    {/* Content Section */}
                    <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-[#0f111a] border border-gray-800 p-5 rounded-2xl">
                                <h2 className="font-display font-semibold text-base text-white mb-4 uppercase tracking-wider text-gray-300">Presets & Filters</h2>
                                
                                <div className="space-y-3 mb-6">
                                    <button onClick={() => applyPreset("bluechip")} className={\`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl transition border \${activePreset === 'bluechip' ? 'border-cyan-500 bg-cyan-950/20 text-cyan-300' : 'border-gray-800 bg-gray-900/40 text-cyan-400 hover:border-cyan-500/30'}\`}>
                                        <span>🛡️ DeFi Blue Chips</span>
                                        <span className={\`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono \${activePreset === 'bluechip' ? 'text-cyan-400 bg-cyan-950 border border-cyan-800/40 animate-pulse' : 'text-gray-500 bg-gray-950 border border-gray-900'}\`}>{activePreset === 'bluechip' ? 'Active' : 'Apply'}</span>
                                    </button>
                                    <button onClick={() => applyPreset("solgems")} className={\`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl transition border \${activePreset === 'solgems' ? 'border-purple-500 bg-purple-950/20 text-purple-300' : 'border-gray-800 bg-gray-900/40 text-purple-400 hover:border-purple-500/30'}\`}>
                                        <span>⚡ Solana Moonshots</span>
                                        <span className={\`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono \${activePreset === 'solgems' ? 'text-purple-400 bg-purple-950 border border-purple-800/40 animate-pulse' : 'text-gray-500 bg-gray-950 border border-gray-900'}\`}>{activePreset === 'solgems' ? 'Active' : 'Apply'}</span>
                                    </button>
                                    <button onClick={() => applyPreset("microcaps")} className={\`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl transition border \${activePreset === 'microcaps' ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300' : 'border-gray-800 bg-gray-900/40 text-emerald-400 hover:border-emerald-500/30'}\`}>
                                        <span>🚀 Microcaps</span>
                                        <span className={\`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono \${activePreset === 'microcaps' ? 'text-emerald-400 bg-emerald-950 border border-emerald-800/40 animate-pulse' : 'text-gray-500 bg-gray-950 border border-gray-900'}\`}>{activePreset === 'microcaps' ? 'Active' : 'Apply'}</span>
                                    </button>
                                    <button onClick={() => applyPreset("base-moonshots")} className={\`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl transition border \${activePreset === 'base-moonshots' ? 'border-blue-500 bg-blue-950/20 text-blue-300' : 'border-gray-800 bg-gray-900/40 text-blue-400 hover:border-blue-500/30'}\`}>
                                        <span>🔵 Base Breakouts</span>
                                        <span className={\`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono \${activePreset === 'base-moonshots' ? 'text-blue-400 bg-blue-950 border border-blue-800/40 animate-pulse' : 'text-gray-500 bg-gray-950 border border-gray-900'}\`}>{activePreset === 'base-moonshots' ? 'Active' : 'Apply'}</span>
                                    </button>
                                    <button onClick={() => applyPreset("high-volume")} className={\`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2 rounded-xl transition border \${activePreset === 'high-volume' ? 'border-amber-500 bg-amber-950/20 text-amber-300' : 'border-gray-800 bg-gray-900/40 text-amber-400 hover:border-amber-500/30'}\`}>
                                        <span>🔥 High Volume</span>
                                        <span className={\`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono \${activePreset === 'high-volume' ? 'text-amber-400 bg-amber-950 border border-amber-800/40 animate-pulse' : 'text-gray-500 bg-gray-950 border border-gray-900'}\`}>{activePreset === 'high-volume' ? 'Active' : 'Apply'}</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">Network Core</label>
                                        <select value={chain} onChange={(e) => setChain(e.target.value)} className="w-full text-sm bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500 transition">
                                            <option value="all">All Networks</option>
                                            <option value="solana">Solana</option>
                                            <option value="base">Base</option>
                                            <option value="bsc">BSC (BNB Chain)</option>
                                            <option value="ethereum">Ethereum</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">Min 24h Vol ($)</label>
                                        <input type="number" value={minVolume} onChange={(e) => setMinVolume(e.target.value)} placeholder="e.g. 50000" className="w-full text-sm bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 font-mono">Min Liquidity ($)</label>
                                        <input type="number" value={minLiquidity} onChange={(e) => setMinLiquidity(e.target.value)} placeholder="e.g. 10000" className="w-full text-sm bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition" />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Market Cap ($)</label>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <input type="number" value={minMarketCap} onChange={(e) => setMinMarketCap(e.target.value)} placeholder="Min" className="text-sm bg-gray-950 border border-gray-800 rounded-xl px-2 py-2 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition" />
                                            <input type="number" value={maxMarketCap} onChange={(e) => setMaxMarketCap(e.target.value)} placeholder="Max" className="text-sm bg-gray-950 border border-gray-800 rounded-xl px-2 py-2 text-white placeholder-gray-600 outline-none focus:border-cyan-500 transition" />
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-800 space-y-2">
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">Outreach Priority</label>
                                        <label className="flex items-center gap-2 text-sm text-gray-300 select-none cursor-pointer">
                                            <input type="checkbox" checked={reqTelegram} onChange={() => setReqTelegram(!reqTelegram)} className="rounded border-gray-800 bg-gray-950 text-cyan-500 focus:ring-0" /> Has Telegram
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-300 select-none cursor-pointer">
                                            <input type="checkbox" checked={reqTwitter} onChange={() => setReqTwitter(!reqTwitter)} className="rounded border-gray-800 bg-gray-950 text-cyan-500 focus:ring-0" /> Has Twitter/X
                                        </label>
                                    </div>

                                    <div className="pt-2 border-t border-gray-800">
                                        <button onClick={() => {
                                            setChain("all"); setMinVolume(""); setMinLiquidity(""); setMinMarketCap(""); setMaxMarketCap("");
                                            setReqTelegram(false); setReqTwitter(false); setReqWebsite(false);
                                        }} className="w-full text-center text-xs font-semibold py-2.5 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-xl transition">
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List Section */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Filter and search control header */}
                            <div className="bg-[#0f111a] border border-gray-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                                {activeTab === "search" ? (
                                    <form onSubmit={(e) => { e.preventDefault(); fetchSearchPairs(searchQuery); }} className="w-full md:w-auto flex-1 flex gap-2">
                                        <div className="relative flex-1">
                                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search standard pairs..." className="w-full text-sm bg-gray-950 border border-gray-800 rounded-xl pl-4 pr-10 py-2.5 text-white placeholder-gray-500 outline-none focus:border-cyan-500 transition" />
                                            <button className="absolute right-3 top-3 text-gray-400"><SearchIcon /></button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="text-sm font-semibold capitalize text-cyan-400">
                                        ⚡ Live {activeTab} Feeds enriched with metrics
                                    </div>
                                )}

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <span className="text-xs font-semibold font-mono text-gray-500">SORT BY:</span>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-xs font-semibold font-sans bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500">
                                        <option value="volume">Volume (24h)</option>
                                        <option value="liquidity">Liquidity</option>
                                        <option value="marketCap">Market Cap</option>
                                    </select>
                                    <button onClick={() => {
                                        if (activeTab === "search") fetchSearchPairs(searchQuery);
                                        else if (activeTab === "trending") fetchTrendingBoosts();
                                        else fetchLatestListings();
                                    }} className="p-2 border border-gray-800 hover:border-gray-700 bg-gray-900/40 rounded-xl transition text-gray-400 hover:text-white" title="Refresh Feed">
                                        🗘
                                    </button>
                                </div>
                            </div>

                            {/* Alert/Status banner */}
                            <div className="text-xs bg-[#112228] border border-emerald-950 p-3 rounded-xl flex items-center justify-between text-emerald-400">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span>Currently showcasing <b>{filteredPairs.length} matches</b> ({pairs.length} loaded globally)</span>
                                </div>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(idx => (
                                        <div key={idx} className="bg-[#0f111a] border border-gray-800 p-5 rounded-2xl space-y-4 animate-pulse">
                                            <div className="flex justify-between items-center">
                                                <div className="h-5 bg-gray-800 rounded w-1/3" />
                                                <div className="h-5 bg-gray-800 rounded w-12" />
                                            </div>
                                            <div className="h-8 bg-gray-800 rounded w-full" />
                                            <div className="grid grid-cols-3 gap-2 pt-2">
                                                <div className="h-10 bg-gray-800 rounded" />
                                                <div className="h-10 bg-gray-800 rounded" />
                                                <div className="h-10 bg-gray-800 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredPairs.length === 0 ? (
                                <div className="border border-dashed border-gray-800 py-12 px-6 rounded-2xl text-center space-y-3">
                                    <p className="text-sm font-semibold text-gray-400">No active pairs detected matching selected criteria</p>
                                    <p className="text-xs text-gray-600">Try loosening your outreach priority parameters or filtering conditions.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredPairs.map((p, idx) => {
                                        const change24 = Number(p.priceChange?.h24 || 0);
                                        const cStyle = getChainStyle(p.chainId);
                                        const hasTg = p.info?.socials?.some(s => s.type === "telegram");
                                        const hasTw = p.info?.socials?.some(s => s.type === "twitter");
                                        const hasWeb = p.info?.websites && p.info.websites.length > 0;
                                        
                                        return (
                                            <div key={idx} className="bg-[#0f111a] border border-gray-800 hover:border-gray-700/60 p-5 rounded-2xl flex flex-col justify-between transition-all relative overflow-hidden group">
                                                {/* Card Header */}
                                                <div>
                                                    <div className="flex items-center justify-between gap-2 mb-3">
                                                        <span className={\`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 border rounded-full \${cStyle}\`}>
                                                            {p.chainId || "Token"}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-mono">DEX: {p.dexId || "N/A"}</span>
                                                    </div>

                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                        <div>
                                                            <h3 className="text-base font-display font-semibold text-white tracking-tight flex items-center gap-1.5">
                                                                {p.baseToken?.name || "Unknown"}
                                                                <span className="text-xs font-mono text-gray-500 font-normal">({p.baseToken?.symbol || "N/A"})</span>
                                                            </h3>
                                                            <div className="text-xs font-mono text-gray-400 inline-flex items-center gap-1.5 bg-gray-950 border border-gray-900 rounded-lg px-2 py-1 mt-1">
                                                                <span>CA: {p.baseToken?.address ? \`\${p.baseToken.address.slice(0,5)}...\${p.baseToken.address.slice(-4)}\` : "N/A"}</span>
                                                                {p.baseToken?.address && (
                                                                    <button onClick={() => copyToClipboard(p.baseToken.address)} className="text-gray-500 hover:text-white transition">
                                                                        {copiedAddress === p.baseToken.address ? <CheckIcon /> : <CopyIcon />}
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <div className="text-base font-semibold font-mono text-cyan-400">\${p.priceUsd ? Number(p.priceUsd).toLocaleString(undefined, {maximumFractionDigits: 6}) : "N/A"}</div>
                                                            <div className={\`text-xs font-semibold inline-flex items-center \${change24 >= 0 ? "text-emerald-400" : "text-rose-400"}\`}>
                                                                {change24 >= 0 ? "+" : ""}{change24}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats grid */}
                                                <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-900/80 py-3 my-3">
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-500 font-mono tracking-widest uppercase">Market Cap</div>
                                                        <div className="text-xs font-semibold font-mono text-gray-300">\${p.marketCap ? Number(p.marketCap).toLocaleString() : (p.fdv ? Number(p.fdv).toLocaleString() : "N/A")}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-500 font-mono tracking-widest uppercase">24h Vol</div>
                                                        <div className="text-xs font-semibold font-mono text-gray-300">\${p.volume?.h24 ? Number(p.volume.h24).toLocaleString() : "N/A"}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-semibold text-gray-500 font-mono tracking-widest uppercase">Liquidity</div>
                                                        <div className="text-xs font-semibold font-mono text-gray-300">\${p.liquidity?.usd ? Number(p.liquidity.usd).toLocaleString() : "N/A"}</div>
                                                    </div>
                                                </div>

                                                {/* Action panel */}
                                                <div className="flex items-center justify-between gap-2 pt-1">
                                                    <div className="flex items-center gap-1.5">
                                                        {hasTg && <span className="text-xs px-2 py-0.5 rounded-md bg-sky-950/40 border border-sky-800/30 text-sky-400 font-mono font-semibold">TG</span>}
                                                        {hasTw && <span className="text-xs px-2 py-0.5 rounded-md bg-slate-900 border border-gray-800 text-gray-300 font-mono font-semibold">X</span>}
                                                        {!hasTg && !hasTw && <span className="text-[10px] text-gray-600 font-mono">No socials detected</span>}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {p.url && (
                                                            <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 px-3 py-1.5 rounded-xl text-gray-300 transition">
                                                                DEX <ExternalIcon />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>`;

  return (
    <div className={`min-h-screen ${theme.bgMain} flex flex-col font-sans transition-colors duration-300`}>
      {/* Upper branding and controller */}
      <header className={`border-b ${theme.bgHeader} py-3 md:py-4 px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4 md:sticky md:top-0 z-50 transition-all duration-300`}>
        {/* Row 1: logo, title, and the mobile theme switcher (top-right corner of the same row on mobile) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="select-none py-1.5 px-3.5 flex items-center justify-center font-display font-bold text-lg text-white border border-[#ff6b35]/40 bg-[#ff6b35]/25 tracking-wide">
              DEXHUNTER
            </div>
            <div>
              <h1 className={`font-display text-xl font-bold tracking-tight ${theme.textTitle} m-0 transition-colors duration-300 uppercase`}>DEXHUNTER</h1>
              <p className={`text-[10px] ${theme.textSub} uppercase tracking-widest font-mono transition-colors duration-300 hidden sm:block`}>Premium Core Discovery Protocol</p>
            </div>
          </div>

          {/* Theme switcher on Row 1 (strictly mobile only) */}
          <button
            id="btn_toggle_theme_mobile"
            onClick={toggleTheme}
            className={`md:hidden flex items-center justify-center transition-all border outline-none cursor-pointer ${
              isDarkMode 
                ? "bg-[#1f1f1f] border-[#2c2c2c] text-yellow-500 hover:text-yellow-400" 
                : "bg-[#f5f4ef] border-gray-300 text-indigo-700 hover:text-indigo-800"
            } w-10 h-10`}
            title="Toggle System Theme Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 transition-transform hover:rotate-12 duration-300" /> : <Moon className="w-4 h-4 transition-transform hover:-rotate-12 duration-300" />}
          </button>
        </div>

        {/* Row 2: dynamic high-fidelity tabs + desktop theme switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <div className={`flex p-1 border text-xs md:text-sm w-full md:w-auto gap-2 transition-colors duration-300 ${theme.bgTabs}`}>
            <button 
              id="tab_search"
              onClick={() => setActiveTab("search")} 
              className={`flex-1 md:flex-none px-4 py-2 font-medium transition-all flex items-center justify-center gap-1.5 ${activeTab === "search" ? "bg-[#ff6b35] text-white" : `${theme.textSub} hover:text-[#ff6b35]`}`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Discover</span>
              <span className="hidden md:inline">Search</span>
            </button>
            
            <button 
              id="tab_trending"
              onClick={() => setActiveTab("trending")} 
              className={`flex-1 md:flex-none px-4 py-2 font-medium transition-all flex items-center justify-center gap-1.5 ${activeTab === "trending" ? "bg-[#ff6b35] text-white" : `${theme.textSub} hover:text-[#ff6b35]`}`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Trending</span>
              <span className="hidden md:inline">Boosts</span>
            </button>
            
            <button 
              id="tab_latest"
              onClick={() => setActiveTab("latest")} 
              className={`flex-1 md:flex-none px-4 py-2 font-medium transition-all flex items-center justify-center gap-1.5 ${activeTab === "latest" ? "bg-[#ff6b35] text-white" : `${theme.textSub} hover:text-[#ff6b35]`}`}
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>Latest</span>
              <span className="hidden md:inline">Listings</span>
            </button>
          </div>

          {/* Desktop Theme Switcher (hidden on mobile) */}
          <button
            id="btn_toggle_theme_desktop"
            onClick={toggleTheme}
            className={`hidden md:flex items-center justify-center transition-all border outline-none cursor-pointer ${
              isDarkMode 
                ? "bg-[#1f1f1f] border-[#2c2c2c] text-yellow-500 hover:text-yellow-400" 
                : "bg-white border-gray-300 text-indigo-600 hover:text-indigo-700 hover:border-gray-400"
            } w-10 h-10 flex-shrink-0`}
            title="Toggle System Theme Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 transition-transform hover:rotate-12 duration-300" /> : <Moon className="w-4 h-4 transition-transform hover:-rotate-12 duration-300" />}
          </button>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Filter and Preset Panel */}
        <div className={`lg:col-span-1 lg:min-w-[280px] space-y-6 ${showFiltersMobile ? "block animate-[fadeIn_0.2s_ease-out]" : "hidden lg:block"}`}>
          
          {/* Quick presets card */}
          <div className={`${theme.bgCard} p-5 lg:px-5 lg:py-6 rounded-none relative overflow-visible transition-all duration-300 border-t-2 border-t-[#ff6b35]`}>
            <CornerBrackets />
            <h2 className={`font-display font-semibold text-xs ${theme.textTitle} uppercase tracking-widest mb-4 flex items-center gap-2 transition-colors duration-300`}>
              <Zap className="w-4 h-4 text-[#ff6b35]" /> Fast Search Presets
            </h2>
            
            <div className="space-y-3 font-mono">
              <button 
                id="btn_preset_bluechip"
                onClick={() => applyPreset("bluechip")} 
                className={`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2.5 border rounded-none transition ${
                  activePreset === "bluechip"
                    ? "border-[#ff6b35] bg-[#ff6b35]/15 text-[#ff6b35]"
                    : "border-[#2b2b2b] hover:border-[#ff6b35]/40 text-gray-400"
                }`}
              >
                <span>🛡️ DeFi Blue Chips</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none border ${
                  activePreset === "bluechip"
                    ? "text-[#ff6b35] bg-[#ff6b35]/20 border-[#ff6b35]/40 animate-pulse"
                    : "text-gray-500 bg-[#141414] border-transparent"
                }`}>
                  {activePreset === "bluechip" ? "Active" : "Setup"}
                </span>
              </button>
              
              <button 
                id="btn_preset_solgems"
                onClick={() => applyPreset("solgems")} 
                className={`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2.5 border rounded-none transition ${
                  activePreset === "solgems"
                    ? "border-[#ff6b35] bg-[#ff6b35]/15 text-[#ff6b35]"
                    : "border-[#2b2b2b] hover:border-[#ff6b35]/40 text-gray-400"
                }`}
              >
                <span>⚡ Solana Gems (Socials)</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none border ${
                  activePreset === "solgems"
                    ? "text-[#ff6b35] bg-[#ff6b35]/20 border-[#ff6b35]/40 animate-pulse"
                    : "text-gray-500 bg-[#141414] border-transparent"
                }`}>
                  {activePreset === "solgems" ? "Active" : "Setup"}
                </span>
              </button>

              <button 
                id="btn_preset_microcaps"
                onClick={() => applyPreset("microcaps")} 
                className={`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2.5 border rounded-none transition ${
                  activePreset === "microcaps"
                    ? "border-[#ff6b35] bg-[#ff6b35]/15 text-[#ff6b35]"
                    : "border-[#2b2b2b] hover:border-[#ff6b35]/40 text-gray-400"
                }`}
              >
                <span>🚀 Microcap DeGens</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none border ${
                  activePreset === "microcaps"
                    ? "text-[#ff6b35] bg-[#ff6b35]/20 border-[#ff6b35]/40 animate-pulse"
                    : "text-gray-500 bg-[#141414] border-transparent"
                }`}>
                  {activePreset === "microcaps" ? "Active" : "Setup"}
                </span>
              </button>

              <button 
                id="btn_preset_base_moonshots"
                onClick={() => applyPreset("base-moonshots")} 
                className={`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2.5 border rounded-none transition ${
                  activePreset === "base-moonshots"
                    ? "border-[#ff6b35] bg-[#ff6b35]/15 text-[#ff6b35]"
                    : "border-[#2b2b2b] hover:border-[#ff6b35]/40 text-gray-400"
                }`}
              >
                <span>🔵 Base Breakouts</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none border ${
                  activePreset === "base-moonshots"
                    ? "text-[#ff6b35] bg-[#ff6b35]/20 border-[#ff6b35]/40 animate-pulse"
                    : "text-gray-500 bg-[#141414] border-transparent"
                }`}>
                  {activePreset === "base-moonshots" ? "Active" : "Setup"}
                </span>
              </button>

              <button 
                id="btn_preset_high_volume"
                onClick={() => applyPreset("high-volume")} 
                className={`w-full text-left inline-flex items-center justify-between text-xs font-semibold px-3 py-2.5 border rounded-none transition ${
                  activePreset === "high-volume"
                    ? "border-[#ff6b35] bg-[#ff6b35]/15 text-[#ff6b35]"
                    : "border-[#2b2b2b] hover:border-[#ff6b35]/40 text-gray-400"
                }`}
              >
                <span>🔥 High-Volume Trenders</span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-none border ${
                  activePreset === "high-volume"
                    ? "text-[#ff6b35] bg-[#ff6b35]/20 border-[#ff6b35]/40 animate-pulse"
                    : "text-gray-500 bg-[#141414] border-transparent"
                }`}>
                  {activePreset === "high-volume" ? "Active" : "Setup"}
                </span>
              </button>
            </div>
          </div>

          {/* Advanced filters card */}
          <div className={`${theme.bgCard} p-5 lg:px-5 lg:py-6 rounded-none relative overflow-visible space-y-5 lg:space-y-6 transition-all duration-300`}>
            <CornerBrackets />
            <h2 className={`font-display font-semibold text-xs ${theme.textTitle} uppercase tracking-widest flex items-center gap-2 transition-colors duration-300`}>
              <SlidersHorizontal className="w-4 h-4 text-[#ff6b35]" /> Advanced Filters
            </h2>

            {/* Filter chain selector */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono transition-colors duration-300`}>Chain Network</label>
              <select 
                id="select_chain"
                value={chain} 
                onChange={(e) => setChain(e.target.value)} 
                className={`w-full text-sm rounded-none px-3 py-2.5 outline-none transition border cursor-pointer ${theme.inputStyle}`}
              >
                <option value="all">All Networks</option>
                <option value="solana">Solana</option>
                <option value="base">Base</option>
                <option value="bsc">BSC (BNB Chain)</option>
                <option value="ethereum">Ethereum</option>
              </select>
            </div>

            {/* Minimum 24h Volume */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono transition-colors duration-300`}>Min 24h Vol (USD)</label>
              <input 
                id="input_min_vol"
                type="number" 
                value={minVolume} 
                onChange={(e) => setMinVolume(e.target.value === "" ? "" : Number(e.target.value))} 
                placeholder="e.g. 100000" 
                className={`w-full text-sm rounded-none px-3 py-2.5 outline-none transition border ${theme.inputStyle} font-mono`}
              />
            </div>

            {/* Minimum Liquidity */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono transition-colors duration-300`}>Min Liquidity (USD)</label>
              <input 
                id="input_min_liq"
                type="number" 
                value={minLiquidity} 
                onChange={(e) => setMinLiquidity(e.target.value === "" ? "" : Number(e.target.value))} 
                placeholder="e.g. 20000" 
                className={`w-full text-sm rounded-none px-3 py-2.5 outline-none transition border ${theme.inputStyle} font-mono`}
              />
            </div>

            {/* Market Cap Range */}
            <div className="space-y-1.5">
              <label className={`block text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono transition-colors duration-300`}>Market Cap (USD)</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  id="input_min_mcap"
                  type="number" 
                  value={minMarketCap} 
                  onChange={(e) => setMinMarketCap(e.target.value === "" ? "" : Number(e.target.value))} 
                  placeholder="Min" 
                  className={`w-full text-sm rounded-none px-2 py-2.5 outline-none transition border text-center ${theme.inputStyle} font-mono`}
                />
                <input 
                  id="input_max_mcap"
                  type="number" 
                  value={maxMarketCap} 
                  onChange={(e) => setMaxMarketCap(e.target.value === "" ? "" : Number(e.target.value))} 
                  placeholder="Max" 
                  className={`w-full text-sm rounded-none px-2 py-2.5 outline-none transition border text-center ${theme.inputStyle} font-mono`}
                />
              </div>
            </div>

            {/* Project Age Dropdown */}
            <div className="space-y-1.5 font-sans">
              <label className={`block text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono transition-colors duration-300`}>Trading Pair Age</label>
              <select 
                id="select_age_filter"
                value={ageFilter} 
                onChange={(e) => setAgeFilter(e.target.value)} 
                className={`w-full text-sm rounded-none px-3 py-2.5 outline-none transition border cursor-pointer ${theme.inputStyle}`}
              >
                <option value="all">All Time (Default)</option>
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="1w">Last Week</option>
                <option value="1m">Last Month</option>
              </select>
            </div>

            {/* Social filter checklist */}
            <div className={`pt-3 border-t ${isDarkMode ? "border-[#2b2b2b]" : "border-gray-250"} space-y-2.5`}>
              <label className={`block text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-mono transition-colors duration-300`}>Outreach Priority (Has Links)</label>
              
              <label className={`flex items-center gap-2.5 text-xs ${theme.textSub} select-none cursor-pointer transition-colors duration-300 font-mono uppercase`}>
                <input 
                  id="chk_req_telegram"
                  type="checkbox" 
                  checked={reqTelegram} 
                  onChange={() => setReqTelegram(!reqTelegram)} 
                  className={`rounded-none border bg-transparent text-[#ff6b35] focus:ring-0 cursor-pointer ${isDarkMode ? "border-gray-800" : "border-slate-300"}`} 
                />
                <span>Has Telegram</span>
              </label>

              <label className={`flex items-center gap-2.5 text-xs ${theme.textSub} select-none cursor-pointer transition-colors duration-300 font-mono uppercase`}>
                <input 
                  id="chk_req_twitter"
                  type="checkbox" 
                  checked={reqTwitter} 
                  onChange={() => setReqTwitter(!reqTwitter)} 
                  className={`rounded-none border bg-transparent text-[#ff6b35] focus:ring-0 cursor-pointer ${isDarkMode ? "border-gray-800" : "border-slate-300"}`} 
                />
                <span>Has Twitter / X</span>
              </label>

              <label className={`flex items-center gap-2.5 text-xs ${theme.textSub} select-none cursor-pointer transition-colors duration-300 font-mono uppercase`}>
                <input 
                  id="chk_req_website"
                  type="checkbox" 
                  checked={reqWebsite} 
                  onChange={() => setReqWebsite(!reqWebsite)} 
                  className={`rounded-none border bg-transparent text-[#ff6b35] focus:ring-0 cursor-pointer ${isDarkMode ? "border-gray-800" : "border-slate-350"}`} 
                />
                <span>Has Website</span>
              </label>
            </div>

            {/* Filtering actions buttons */}
            <div className={`pt-3 border-t ${isDarkMode ? "border-[#2b2b2b]" : "border-gray-250"}`}>
              <button 
                id="btn_preset_reset_filter_settings"
                onClick={resetFilters} 
                className={`w-full text-center text-xs font-mono font-semibold py-2.5 transition rounded-none uppercase ${theme.btnSecondary}`}
              >
                Reset Filter Settings
              </button>
            </div>

          </div>

        </div>

        {/* Right Side: Primary interactive layout list */}
        <div className="lg:col-span-3 space-y-6">

          {/* Inline controller layout */}
          <div className={`p-4 rounded-none relative overflow-visible flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${theme.bgCard}`}>
            <CornerBrackets />
            
            {activeTab === "search" ? (
              <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex-1 flex gap-2">
                <div className="relative flex-1">
                  <input 
                    id="input_search_query"
                    type="text" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                    placeholder="Search by token address, symbol, name, or keywords..." 
                    className={`w-full text-sm rounded-none pl-4 pr-10 py-2.5 outline-none transition border ${theme.inputStyle}`} 
                  />
                  <button 
                    id="btn_search_submit"
                    type="submit" 
                    className={`absolute right-3 top-3.5 transition ${isDarkMode ? "text-gray-400 hover:text-[#ff6b35]" : "text-slate-400 hover:text-[#ff6b35]"}`}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#ff6b35]">
                <Sparkles className="w-4 h-4 text-[#ff6b35]" /> Live {activeTab} Alerts (Enriched with full metrics)
              </div>
            )}

            {/* Quick Quicktags for searching */}
            {activeTab === "search" && (
              <div className="hidden xl:flex items-center gap-1.5 text-xs">
                <span className={`${theme.textMuted} font-mono text-[10px] uppercase`}>Quick Tags:</span>
                {quickSearchTags.map(tag => (
                  <button 
                    id={`quick_tag_${tag}`}
                    key={tag} 
                    onClick={() => { setSearchQuery(tag); fetchSearchPairs(tag); }} 
                    className={`px-2.5 py-1 rounded-none font-mono text-[10px] uppercase border transition-all duration-250 cursor-pointer ${theme.btnSecondary}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end flex-wrap sm:flex-nowrap">
              <button 
                id="btn_toggle_filters_sidebar"
                onClick={() => setShowFiltersMobile(prev => !prev)} 
                className={`lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-none text-xs font-semibold border transition cursor-pointer ${
                  showFiltersMobile 
                    ? "bg-[#ff6b35] border-[#ff6b35] text-white" 
                    : theme.btnSecondary
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showFiltersMobile ? "Hide Filters" : "Filter & Presets"}</span>
              </button>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-semibold font-mono ${theme.textMuted} uppercase tracking-widest`}>Sort:</span>
                <select 
                  id="select_sorting"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)} 
                  className={`text-xs font-semibold font-sans rounded-none px-3 py-2 outline-none focus:border-[#ff6b35] border ${theme.inputStyle}`}
                >
                  <option value="volume">Volume (24h)</option>
                  <option value="liquidity">Liquidity</option>
                  <option value="priceChange">Price Change (24h)</option>
                  <option value="marketCap">Market Cap</option>
                  <option value="newest">Newest First</option>
                  <option value="none">No Sort</option>
                </select>
              </div>

              <button 
                id="btn_refresh_raw"
                onClick={() => {
                  if (activeTab === "search") fetchSearchPairs(searchQuery);
                  else if (activeTab === "trending") fetchTrendingBoosts();
                  else fetchLatestListings();
                }} 
                className={`p-2.5 rounded-xl transition border cursor-pointer ${theme.btnSecondary}`} 
                title="Refresh current page feed"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

          </div>

          {/* Quick status alerts counter */}
          <div className={`p-3.5 rounded-xl flex items-center justify-between text-xs gap-4 transition-colors duration-300 ${
            isDarkMode 
              ? "bg-[#112228]/50 border border-emerald-950/40 text-emerald-400" 
              : "bg-emerald-50 border border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-50/50"
          }`}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span><b>{filteredAndSortedPairs.length} valid projects</b> — liquidity-wiped pairs excluded</span>
            </div>

            <button 
              id="btn_export_csv"
              onClick={handleExportToCSV}
              disabled={filteredAndSortedPairs.length === 0}
              className={`flex items-center gap-1.5 px-3 py-1 font-mono font-semibold text-[11px] uppercase tracking-wider border rounded-none cursor-pointer transition flex-shrink-0 ${
                isDarkMode 
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-950/80 hover:border-emerald-400 disabled:opacity-40 disabled:hover:bg-emerald-950/40" 
                  : "bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100/50 disabled:opacity-40 disabled:hover:bg-white"
              }`}
              title="Export filtered and sorted pairs to CSV file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Error indicator */}
          {error && (
            <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-xl text-red-400 text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider">Interface Fetch Error</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* Card list layout */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className={`p-5 rounded-2xl space-y-4 animate-pulse border ${theme.bgCard}`}>
                  <div className="flex justify-between items-center">
                    <div className={`h-5 rounded w-1/3 ${isDarkMode ? "bg-gray-800" : "bg-slate-200"}`} />
                    <div className={`h-5 rounded w-12 ${isDarkMode ? "bg-gray-800" : "bg-slate-200"}`} />
                  </div>
                  <div className={`h-7 rounded w-full ${isDarkMode ? "bg-gray-800" : "bg-slate-200"}`} />
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className={`h-8 rounded ${isDarkMode ? "bg-gray-800" : "bg-slate-200"}`} />
                    <div className={`h-8 rounded ${isDarkMode ? "bg-gray-800" : "bg-slate-200"}`} />
                    <div className={`h-8 rounded ${isDarkMode ? "bg-gray-800" : "bg-slate-200"}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedPairs.length === 0 ? (
            <div className={`border border-dashed py-16 px-6 rounded-2xl text-center space-y-4 ${
              isDarkMode ? "border-gray-800 bg-[#0f111a]/20" : "border-slate-300 bg-slate-50/50"
            }`}>
              <p className={`text-sm font-semibold ${theme.textTitle}`}>No token pairs matched your filters</p>
              <p className={`text-xs max-w-md mx-auto ${theme.textSub}`}>
                No pairs on {chain === 'all' ? 'the networks' : chain.toUpperCase()} passed your search query "{searchQuery}" and filter requirements. Try relaxing your filters or typing different keywords.
              </p>
              <button 
                id="btn_fallback_clear"
                onClick={resetFilters} 
                className={`px-4 py-2 border rounded-none text-xs font-mono font-semibold transition cursor-pointer ${theme.btnSecondary}`}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              <AnimatePresence mode="popLayout">
                {paginatedPairs.map((pair, index) => {
                  const chainBadge = getChainBadgeStyle(pair.chainId);
                  const volume24h = pair.volume?.h24;
                  const priceChange24h = pair.priceChange?.h24 || 0;
                  const marketCapValue = pair.marketCap || pair.fdv;
                  const liquidityValue = pair.liquidity?.usd;
                  
                  // Collect socials
                  const socialsList = pair.info?.socials || [];
                  const websitesList = pair.info?.websites || [];
                  
                  const tgUrl = socialsList.find(s => s.type === "telegram")?.url;
                  const twUrl = socialsList.find(s => s.type === "twitter")?.url;
                  const webUrl = websitesList[0]?.url;
                  
                  return (
                    <motion.div 
                      key={`${pair.chainId}-${pair.pairAddress}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.4) }}
                      className={`p-5 rounded-none flex flex-col justify-between transition-all relative overflow-hidden group border ${theme.bgCard} ${
                        isDarkMode ? "hover:border-[#ff6b35]/65" : "hover:border-gray-400"
                      }`}
                    >
                      <CornerBrackets />

                      <div>
                        {/* Chain network indicator and Dex Id */}
                        <div className="flex items-center justify-between gap-2 mb-3 lg:mb-3 relative z-10 font-mono">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <ChainIcon chainId={pair.chainId} fallbackClass={chainBadge.bg} />
                            {pair.pairCreatedAt && (Date.now() - pair.pairCreatedAt <= 3600000) && (
                              <span className="inline-flex items-center gap-1 text-[9px] uppercase font-mono font-bold tracking-widest px-1.5 py-0.5 bg-[#ff6b35]/10 border border-[#ff6b35]/40 text-[#ff6b35] animate-pulse">
                                🆕 NEW
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col items-end text-right">
                            <span className={`text-[10.5px] uppercase ${theme.textSub}`}>DEX: {pair.dexId}</span>
                            <span className="text-[10px] text-[#ff6b35] font-medium flex items-center gap-1 mt-0.5" title={pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toUTCString() : "No timestamp"}>
                              <Clock className={`w-2.5 h-2.5 text-[#ff6b35]`} /> {pair.pairCreatedAt ? formatTimeAgo(pair.pairCreatedAt) : "Unknown age"}
                            </span>
                          </div>
                        </div>

                        {/* Token name / Symbol / Contract */}
                        <div className="flex items-start justify-between gap-2 mb-4 lg:mb-3 relative z-10">
                          <div className="flex-1 min-w-0 flex items-start gap-3">
                            <TokenImage imageUrl={pair.info?.imageUrl} symbol={pair.baseToken?.symbol} />
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-base font-display font-semibold ${theme.textTitle} tracking-tight flex items-center gap-1.5 truncate`}>
                                {pair.baseToken?.name || "Unknown Asset"}
                                <span className={`text-xs font-mono font-normal ${theme.textMuted}`}>({pair.baseToken?.symbol || "N/A"})</span>
                              </h3>
                              
                              <div className={`text-xs font-mono inline-flex items-center gap-1.5 rounded-none px-2.5 py-1 mt-2 border ${theme.bgInner} ${theme.textSub} lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:max-w-[160px] lg:mt-3 lg:w-auto lg:h-auto`}>
                                <span className="text-[11px]">CA: {pair.baseToken?.address ? `${pair.baseToken.address.slice(0, 6)}...${pair.baseToken.address.slice(-5)}` : "Unavailable"}</span>
                                {pair.baseToken?.address && (
                                  <button 
                                    id={`btn_copy_${pair.baseToken.address}`}
                                    onClick={(e) => { e.stopPropagation(); copyToClipboard(pair.baseToken.address); }} 
                                    className={`${theme.textMuted} hover:text-[#ff6b35] transition cursor-pointer`}
                                    title="Copy contract address"
                                  >
                                    {copiedAddress === pair.baseToken.address ? (
                                      <Check className="w-3.5 h-3.5 text-[#6ebd80]" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Price metrics */}
                          <div className="text-right flex-shrink-0">
                            <div className="text-base font-semibold font-mono text-[#ff6b35]">
                              ${pair.priceUsd ? Number(pair.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 6 }) : "N/A"}
                            </div>
                            <div className={`text-xs font-semibold inline-flex items-center gap-1 ${priceChange24h >= 0 ? "text-[#6ebd80] animate-pulse" : "text-[#cc5a5a]"}`}>
                              {priceChange24h >= 0 ? "+" : ""}{priceChange24h}% (24h)
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Price Trend Chart 24H */}
                      <div className="my-2 lg:my-0 lg:mb-3 relative z-10">
                        <div className="flex items-center justify-between mb-1 text-[10px] font-mono tracking-wider">
                          <span className={`${theme.textMuted} uppercase`}>24H Price Trend</span>
                          <span className={priceChange24h >= 0 ? "text-[#6ebd80]" : "text-[#cc5a5a]"}>
                            {priceChange24h >= 0 ? "📈" : "📉"} {priceChange24h >= 0 ? "+" : ""}{priceChange24h}%
                          </span>
                        </div>
                        <div className={`h-16 w-full p-1 border ${isDarkMode ? "bg-black/40 border-[#2b2b2b]" : "bg-gray-50 border-gray-200"}`}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                              data={generatePriceHistory(pair)} 
                              margin={{ top: 2, right: 2, left: 2, bottom: 2 }}
                            >
                              <defs>
                                <linearGradient id={`gradient-${pair.chainId}-${pair.pairAddress}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={priceChange24h >= 0 ? "#6ebd80" : "#cc5a5a"} stopOpacity={0.25}/>
                                  <stop offset="95%" stopColor={priceChange24h >= 0 ? "#6ebd80" : "#cc5a5a"} stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="time" hide />
                              <YAxis domain={['auto', 'auto']} hide />
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const val = Number(payload[0].value);
                                    const formattedVal = val < 0.001 
                                      ? val.toFixed(6) 
                                      : val < 1 
                                        ? val.toFixed(4) 
                                        : val.toLocaleString(undefined, { maximumFractionDigits: 2 });
                                    return (
                                      <div className={`border p-1.5 text-[9px] font-mono shadow-xl rounded-none ${
                                        isDarkMode 
                                          ? "bg-gray-950 border-gray-800 text-white" 
                                          : "bg-white border-gray-200 text-gray-900"
                                      }`}>
                                        <p className="font-semibold text-[8.5px] text-gray-500">{payload[0].payload.time}</p>
                                        <p className={priceChange24h >= 0 ? "text-[#6ebd80] font-bold" : "text-[#cc5a5a] font-bold"}>
                                          ${formattedVal}
                                        </p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                                cursor={{ stroke: isDarkMode ? '#ff6b35' : '#ddd', strokeWidth: 0.5, strokeDasharray: '3 3' }} 
                              />
                              <Area 
                                type="monotone" 
                                dataKey="price" 
                                stroke={priceChange24h >= 0 ? "#6ebd80" : "#cc5a5a"} 
                                strokeWidth={1.5}
                                fillOpacity={1} 
                                fill={`url(#gradient-${pair.chainId}-${pair.pairAddress})`}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Info layout metrics grid */}
                      <div className={`grid grid-cols-3 gap-2 border-t border-b py-3.5 my-3 lg:my-0 lg:mb-3 relative z-10 font-mono transition-colors duration-300 ${isDarkMode ? "border-[#2b2b2b]" : "border-gray-200"}`}>
                        <div>
                          <div className={`text-[9px] font-semibold tracking-widest uppercase ${theme.textMuted}`}>Market Cap</div>
                          <div className={`text-xs font-semibold mt-0.5 ${theme.textTitle}`}>
                            {marketCapValue ? `$${Number(marketCapValue).toLocaleString()}` : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className={`text-[9px] font-semibold tracking-widest uppercase ${theme.textMuted}`}>24h Vol</div>
                          <div className={`text-xs font-semibold mt-0.5 ${theme.textTitle}`}>
                            {volume24h ? `$${Number(volume24h).toLocaleString()}` : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className={`text-[9px] font-semibold tracking-widest uppercase ${theme.textMuted}`}>Liquidity</div>
                          <div className={`text-xs font-semibold mt-0.5 ${theme.textTitle}`}>
                            {liquidityValue ? `$${Number(liquidityValue).toLocaleString()}` : "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Bottom row actions and socials presence - all real direct links */}
                      <div className="flex items-center justify-between gap-2 pt-1 relative z-10 font-mono">
                        {/* Target prioritization links */}
                        <div className="flex items-center gap-1.5">
                          {tgUrl ? (
                            <a 
                              href={tgUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="text-[9px] font-bold px-2 py-0.5 bg-sky-950/40 border border-sky-800/35 text-sky-450 hover:bg-sky-900/40 transition rounded-none uppercase font-mono"
                            >
                              TG
                            </a>
                          ) : null}
                          {twUrl ? (
                            <a 
                              href={twUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="text-[9px] font-bold px-2 py-0.5 bg-slate-900 border border-gray-800 text-gray-350 hover:bg-gray-800/80 transition rounded-none uppercase font-mono"
                            >
                              X
                            </a>
                          ) : null}
                          {webUrl ? (
                            <a 
                              href={webUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              onClick={(e) => e.stopPropagation()}
                              className="text-[9px] font-bold px-2 py-0.5 bg-emerald-950/40 border border-emerald-800/35 text-emerald-450 hover:bg-emerald-900/40 transition rounded-none uppercase font-mono"
                            >
                              WEB
                            </a>
                          ) : null}
                          {!tgUrl && !twUrl && !webUrl && (
                            <span className={`text-[10px] font-sans italic ${theme.textMuted}`}>No links detected</span>
                          )}
                        </div>

                        {/* Interactive direct link buttons */}
                        <div className="flex items-center gap-2">
                          {pair.url && (
                            <a 
                              href={pair.url} 
                              target="_blank" 
                              rel="noreferrer noopener"
                              className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-3 py-1.5 rounded-none border transition-all duration-200 cursor-pointer ${theme.btnSecondary}`}
                            >
                              DEX <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination Controls */}
          {filteredAndSortedPairs.length > PAGE_SIZE && (
            <div className={`mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-none border relative overflow-visible transition-all duration-300 ${theme.bgCard}`}>
              <CornerBrackets />
              <div className={`text-xs font-mono ${theme.textSub}`}>
                Showing <span className={`font-semibold ${theme.textTitle}`}>{Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredAndSortedPairs.length)}</span> to <span className={`font-semibold ${theme.textTitle}`}>{Math.min(currentPage * PAGE_SIZE, filteredAndSortedPairs.length)}</span> of <span className="font-semibold text-[#ff6b35]">{filteredAndSortedPairs.length}</span> tokens
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  id="btn_prev_page"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-none text-xs font-semibold border font-mono transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${theme.btnSecondary}`}
                >
                  Previous
                </button>

                <span className={`text-xs font-mono font-semibold ${theme.textSub}`}>
                  Page <span className="font-bold text-[#ff6b35]">{currentPage}</span> of <span className={theme.textTitle}>{totalPages}</span>
                </span>

                <button
                  id="btn_next_page"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-none text-xs font-semibold border font-mono transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${theme.btnSecondary}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Humble Footer with live indicators */}
      <footer className={`border-t p-6 text-center text-xs font-mono tracking-wider transition-all duration-300 border-t border-b-0 ${
        isDarkMode 
          ? "bg-[#07080d] border-gray-900 text-gray-650" 
          : "bg-slate-100 border-slate-200 text-slate-500 shadow-inner"
      }`}>
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
          <span>&copy; {new Date().getFullYear()} DEXHUNTER PROTOCOL. ALL SECRETS SECURED.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> LIVE CONNECTIVITY
            </span>
            <span>API: API.DEXSCREENER.COM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
