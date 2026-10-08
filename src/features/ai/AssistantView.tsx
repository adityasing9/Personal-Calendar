import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../database/db';
import {
  parseNaturalLanguageInput,
  queryLocalScheduleAssistant,
  ParsedItemPreview,
  AssistantMessage
} from '../../services/aiService';
import { carryTaskForward, postponeTaskToTomorrow, keepTaskOverdue } from '../../services/carryForward';
import { formatDisplayDate, formatTimeDisplay } from '../../utils/dateUtils';
import { formatNepaliDisplay } from '../../utils/nepaliCalendar';

interface AssistantViewProps {
  onRefreshData: () => void;
}

export const AssistantView: React.FC<AssistantViewProps> = ({ onRefreshData }) => {
  const [nlInput, setNlInput] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ParsedItemPreview | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello! I'm your local Life Calendar assistant.\n\nI can answer questions about your exams, deadlines, and schedule, or parse natural language into calendar items. Everything stays 100% on your device.`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Natural Language Input parse
  const handleParseInput = (text: string) => {
    setNlInput(text);
    if (!text.trim()) {
      setParsedPreview(null);
      return;
    }
    const result = parseNaturalLanguageInput(text);
    setParsedPreview(result);
  };

  // Save parsed preview item
  const handleSaveParsedItem = async () => {
    if (!parsedPreview) return;
    const now = new Date().toISOString();
    const id = `${parsedPreview.type}-${Date.now()}`;

    if (parsedPreview.type === 'task') {
      await db.tasks.put({
        id,
        title: parsedPreview.title,
        dueDate: parsedPreview.date,
        dueTime: parsedPreview.time,
        priority: parsedPreview.priority,
        status: 'not_started',
        category: 'college',
        createdAt: now,
        updatedAt: now
      });
    } else if (parsedPreview.type === 'event') {
      await db.events.put({
        id,
        title: parsedPreview.title,
        startDate: parsedPreview.date,
        startTime: parsedPreview.time,
        allDay: !parsedPreview.time,
        category: 'college',
        priority: parsedPreview.priority,
        status: 'scheduled',
        createdAt: now,
        updatedAt: now
      });
    } else if (parsedPreview.type === 'exam') {
      const allSubs = await db.subjects.toArray();
      const matchedSub = allSubs.find(s => s.name.toUpperCase().includes(parsedPreview.subjectCodeOrName || '') || s.code.toUpperCase().includes(parsedPreview.subjectCodeOrName || ''));

      await db.exams.put({
        id,
        subjectId: matchedSub ? matchedSub.id : (allSubs[0]?.id ?? 'sub-dbms'),
        type: 'IA',
        date: parsedPreview.date,
        startTime: parsedPreview.time || '10:00',
        preparationStatus: 'not_started',
        priority: 'critical',
        createdAt: now
      });
    } else if (parsedPreview.type === 'shopping') {
      await db.shoppingItems.put({
        id,
        name: parsedPreview.title,
        quantity: '1',
        category: 'Electronics',
        priority: parsedPreview.priority === 'critical' ? 'urgent' : 'soon',
        targetDate: parsedPreview.date,
        status: 'pending',
        createdAt: now
      });
    }

    confetti({ particleCount: 35, spread: 60 });
    setNlInput('');
    setParsedPreview(null);
    onRefreshData();
  };

  // Chat message send
  const handleSendChat = async (promptToSend?: string) => {
    const text = promptToSend || chatInput;
    if (!text.trim()) return;

    const userMsg: AssistantMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsProcessing(true);

    try {
      const botResponse = await queryLocalScheduleAssistant(text);
      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleActionClick = async (action: string, payload?: any) => {
    if (action === 'move_tomorrow' && payload?.taskId) {
      const task = await db.tasks.get(payload.taskId);
      if (task) await postponeTaskToTomorrow(task);
    } else if (action === 'carry_today' && payload?.taskId) {
      const task = await db.tasks.get(payload.taskId);
      if (task) await carryTaskForward(task);
    } else if (action === 'keep_overdue' && payload?.taskId) {
      const task = await db.tasks.get(payload.taskId);
      if (task) await keepTaskOverdue(task);
    }
    onRefreshData();
    // Add confirmation message
    setMessages((prev) => [
      ...prev,
      {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        content: `Updated task successfully! Check your Attention section or Tasks tab.`,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Assistant & Natural Language
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Local smart scheduling, priority engine, and quick natural syntax parsing
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Local Privacy Guaranteed (0 bytes sent to cloud)</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. NATURAL LANGUAGE QUICK ADD PARSER */}
      {/* ======================================================== */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Natural Language Quick Add
          </h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Type naturally. The parser shows a structured preview for you to verify before saving.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => handleParseInput(e.target.value)}
            placeholder='e.g. "DBMS exam on October 14 at 10 AM" or "Buy USB cable today"'
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        {/* Quick Example Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span>Try:</span>
          {[
            'DBMS exam on October 14 at 10 AM',
            'Buy USB-C cable today',
            'Project review tomorrow at 2pm',
            'AI documentation due Friday'
          ].map((sample) => (
            <button
              key={sample}
              onClick={() => handleParseInput(sample)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              {sample}
            </button>
          ))}
        </div>

        {/* Parsed Result Interactive Confirmation Preview */}
        {parsedPreview && (
          <div className="mt-3 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                Parsed Structure Preview
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                Type: {parsedPreview.type.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Title:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{parsedPreview.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Date:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{formatDisplayDate(parsedPreview.date)}</span>
                <span className="text-[10px] text-slate-500 block">({formatNepaliDisplay(parsedPreview.date)})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Time:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{parsedPreview.time ? formatTimeDisplay(parsedPreview.time) : 'All day'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Priority:</span>
                <span className="font-bold uppercase text-purple-600 dark:text-purple-400">{parsedPreview.priority}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/40">
              <button
                onClick={() => setParsedPreview(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Discard
              </button>
              <button
                onClick={handleSaveParsedItem}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. CONVERSATIONAL SCHEDULE ADVISOR */}
      {/* ======================================================== */}
      <div className="p-5 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[460px]">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Personal Schedule Advisor
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Context: Local IndexedDB</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {m.content}
              </div>

              {/* Action buttons embedded in message */}
              {m.suggestedActions && m.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {m.suggestedActions.map((act) => (
                    <button
                      key={act.action}
                      onClick={() => handleActionClick(act.action, act.payload)}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 cursor-pointer shadow-xs"
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="text-slate-400 text-xs italic">Analyzing your schedule...</div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            'What do I have this week?',
            'What should I finish first?',
            "I didn't finish my documentation"
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => handleSendChat(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 shrink-0 cursor-pointer"
            >
              "{chip}"
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendChat();
          }}
          className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask anything about your schedule, exams, or priorities..."
            className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!chatInput.trim()}
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
