import React, { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  CheckCircle2,
  Calendar,
  DollarSign,
  Tag,
  Trash2,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../database/db';
import { ShoppingItem, ShoppingPriority } from '../../types';
import { formatShortDate } from '../../utils/dateUtils';
import { SHOPPING_PRIORITY_CONFIG } from '../../utils/categories';
import { QuickAddType } from '../../components/modals/QuickAddModal';

interface ShoppingViewProps {
  items: ShoppingItem[];
  onOpenQuickAdd: (type?: QuickAddType, date?: string) => void;
  onRefreshData: () => void;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  items,
  onOpenQuickAdd,
  onRefreshData
}) => {
  const [activeTab, setActiveTab] = useState<ShoppingPriority | 'purchased' | 'all'>('urgent');

  const pendingItems = items.filter((i) => i.status === 'pending');
  const purchasedItems = items.filter((i) => i.status === 'purchased');

  const urgentList = pendingItems.filter((i) => i.priority === 'urgent');
  const soonList = pendingItems.filter((i) => i.priority === 'soon');
  const laterList = pendingItems.filter((i) => i.priority === 'later');
  const wishlist = pendingItems.filter((i) => i.priority === 'wishlist');

  let currentList = pendingItems;
  if (activeTab === 'urgent') currentList = urgentList;
  else if (activeTab === 'soon') currentList = soonList;
  else if (activeTab === 'later') currentList = laterList;
  else if (activeTab === 'wishlist') currentList = wishlist;
  else if (activeTab === 'purchased') currentList = purchasedItems;

  const totalEstCost = pendingItems.reduce((acc, curr) => acc + (curr.estimatedPrice || 0), 0);
  const totalActualSpent = purchasedItems.reduce((acc, curr) => acc + (curr.actualPrice || curr.estimatedPrice || 0), 0);

  const handleTogglePurchased = async (item: ShoppingItem) => {
    const nextStatus = item.status === 'purchased' ? 'pending' : 'purchased';
    if (nextStatus === 'purchased') {
      confetti({ particleCount: 30, spread: 50 });
    }
    await db.shoppingItems.update(item.id, { status: nextStatus });
    onRefreshData();
  };

  const handleDeleteItem = async (id: string) => {
    await db.shoppingItems.delete(id);
    onRefreshData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Shopping & Purchases
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organized by urgency: Urgent (Today), Soon (This week), Later, and Wishlist
          </p>
        </div>

        <button
          onClick={() => onOpenQuickAdd('shopping')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Spend Tracker Metric Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-3xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Urgent Today</span>
          <p className="text-lg font-black text-red-600 dark:text-red-400">{urgentList.length} items</p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Total Pending</span>
          <p className="text-lg font-black text-slate-800 dark:text-slate-200">{pendingItems.length} items</p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Estimated Budget</span>
          <p className="text-lg font-black text-blue-600 dark:text-blue-400">${totalEstCost.toFixed(2)}</p>
        </div>
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-400">Actual Spent</span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">${totalActualSpent.toFixed(2)}</p>
        </div>
      </div>

      {/* Urgency Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {[
          { id: 'urgent', label: 'Urgent (Today)', count: urgentList.length, color: 'text-red-600' },
          { id: 'soon', label: 'Soon (This week)', count: soonList.length, color: 'text-amber-600' },
          { id: 'later', label: 'Later', count: laterList.length, color: 'text-blue-600' },
          { id: 'wishlist', label: 'Wishlist', count: wishlist.length, color: 'text-slate-500' },
          { id: 'purchased', label: 'Purchased', count: purchasedItems.length, color: 'text-emerald-600' },
          { id: 'all', label: 'All Items', count: items.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === tab.id
                  ? 'bg-white/20 dark:bg-black/20 text-current'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Nothing on your shopping list in this category.
          </div>
        ) : (
          currentList.map((item) => {
            const isPurchased = item.status === 'purchased';
            const priorityStyle = SHOPPING_PRIORITY_CONFIG[item.priority];

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isPurchased
                    ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-65'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    onClick={() => handleTogglePurchased(item)}
                    className={`mt-0.5 p-1 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isPurchased
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-500'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${priorityStyle.badgeBg} ${priorityStyle.color}`}>
                        {priorityStyle.label}
                      </span>
                      {item.category && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {item.category}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                        isPurchased ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {item.name} {item.quantity && item.quantity !== '1' ? `(x${item.quantity})` : ''}
                    </h4>

                    {item.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      {item.targetDate && (
                        <span>Target: {formatShortDate(item.targetDate)}</span>
                      )}
                      {item.estimatedPrice && (
                        <span>Est: ${item.estimatedPrice}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
