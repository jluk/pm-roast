"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { domToPng } from "modern-screenshot";
import { PokemonCard, PMElement, PMMove } from "./PokemonCard";
import { CardBack } from "./CardBack";
import { getCardRarity } from "./HoloCard";
import { useRef } from "react";

// Card data that can be shown in the modal
interface CardData {
  score: number;
  archetypeName: string;
  archetypeEmoji: string;
  archetypeDescription: string;
  archetypeImage?: string;
  element: PMElement;
  moves: PMMove[];
  stage?: string;
  weakness?: string;
  flavor?: string;
  compact?: boolean;
  userName?: string;
  bangerQuote?: string;
  naturalRival?: string;
}

interface CardModalContextType {
  openModal: (data: CardData) => void;
  closeModal: () => void;
  isOpen: boolean;
}

const CardModalContext = createContext<CardModalContextType | null>(null);

export function useCardModal() {
  const context = useContext(CardModalContext);
  if (!context) {
    throw new Error("useCardModal must be used within a CardModalProvider");
  }
  return context;
}

export function CardModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalCardRef = useRef<HTMLDivElement>(null);

  const openModal = useCallback((data: CardData) => {
    setCardData(data);
    setIsOpen(true);
    setIsFlipped(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsFlipped(false);
  }, []);

  const handleModalClick = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleCloseModal = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    closeModal();
  }, [closeModal]);

  const handleDownload = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!modalCardRef.current || isDownloading || !cardData) return;

    setIsDownloading(true);
    try {
      const dataUrl = await domToPng(modalCardRef.current, {
        scale: 2,
        quality: 1,
      });

      const link = document.createElement("a");
      link.download = `pm-card-${cardData.archetypeName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to download card:", error);
    } finally {
      setIsDownloading(false);
    }
  }, [cardData, isDownloading]);

  const rarity = cardData ? getCardRarity(cardData.score) : "common";

  return (
    <CardModalContext.Provider value={{ openModal, closeModal, isOpen }}>
      {children}

      {/* Single Global Modal */}
      <AnimatePresence>
        {isOpen && cardData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md isolate"
            onClick={handleCloseModal}
          >
            {/* Close hint */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 text-white/60 text-sm flex items-center gap-2"
            >
              <span>Click card to flip</span>
              <span className="text-white/40">|</span>
              <span>Click outside to close</span>
            </motion.div>

            {/* Flippable Card Container - fixed dimensions to prevent layout shift */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => {
                e.stopPropagation();
                handleModalClick();
              }}
              className="cursor-pointer isolate overflow-visible"
              style={{
                perspective: "1000px",
                // Full-size card dimensions (2.5:3.5 aspect ratio)
                width: 360,
                height: 504,
              }}
            >
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  transformStyle: "preserve-3d",
                  width: "100%",
                  height: "100%",
                  willChange: "transform",
                }}
                className="relative isolate"
              >
                {/* Front of card */}
                <div
                  ref={modalCardRef}
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <PokemonCard
                    score={cardData.score}
                    archetypeName={cardData.archetypeName}
                    archetypeEmoji={cardData.archetypeEmoji}
                    archetypeDescription={cardData.archetypeDescription}
                    archetypeImage={cardData.archetypeImage}
                    element={cardData.element}
                    moves={cardData.moves}
                    stage={cardData.stage}
                    weakness={cardData.weakness}
                    flavor={cardData.flavor}
                    compact={false}
                    userName={cardData.userName}
                  />
                </div>

                {/* Back of card */}
                <div
                  className="absolute inset-0"
                  style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <CardBack
                    compact={false}
                    rarity={rarity}
                    roastSummary={{
                      archetypeName: cardData.archetypeName,
                      score: cardData.score,
                      bangerQuote: cardData.bangerQuote || cardData.archetypeDescription,
                      userName: cardData.userName,
                      element: cardData.element,
                      naturalRival: cardData.naturalRival,
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Download button - fixed at bottom center */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(e);
              }}
              disabled={isDownloading}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium disabled:opacity-50 z-[10000]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isDownloading ? "Saving..." : "Download Card"}
            </motion.button>

            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleCloseModal}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </CardModalContext.Provider>
  );
}
