"use client";

import { useState, ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
};

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  if (tabs.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* En-tête des onglets */}
      <div className="flex gap-2 border-b border-[#e7e1d9]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[#3b1f4a] text-[#3b1f4a]"
                : "text-[#7a7184] hover:text-[#3b1f4a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="min-h-[200px]">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
