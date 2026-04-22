'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { parseP0CommandAction } from '@/backend/actions/ai.actions';
import { createStory } from '@/backend/actions/stories.actions';
import { getActiveSprintAction, getOperationalSprintsAction } from '@/backend/actions/sprints.actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/utils/cn';

export function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [activeSprint, setActiveSprint] = React.useState<any>(null);
  const [operationalSprints, setOperationalSprints] = React.useState<any[]>([]);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [pendingInjection, setPendingInjection] = React.useState<any>(null);
  const [predictedMetadata, setPredictedMetadata] = React.useState<any>(null);
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const sprintIdFromUrl = params?.sprintId as string;

  React.useEffect(() => {
    if (!isOpen || !query || query.length < 5) {
      setPredictedMetadata(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const result = await parseP0CommandAction(query);
        if (result.success) {
          setPredictedMetadata(result.data);
        }
      } catch (e) {}
    }, 800);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      getOperationalSprintsAction().then(setOperationalSprints);
      if (!sprintIdFromUrl) {
        getActiveSprintAction().then(setActiveSprint);
      } else {
        setActiveSprint({ id: sprintIdFromUrl, sprintName: 'Current Sprint' });
      }
    } else {
      setSelectionMode(false);
      setPendingInjection(null);
      setSelectedIndex(0);
      setPredictedMetadata(null);
    }
  }, [isOpen, sprintIdFromUrl]);

  const completeStoryInjection = async (sprintId: string, sprintName: string, storyData: any) => {
    try {
      const createResult = await createStory({
        sprint_id: sprintId,
        title: storyData.title,
        description: storyData.description,
        story_points: storyData.estimatedPoints,
        priority: storyData.priority,
        column_id: 'todo',
        status: 'todo',
      });
      
      if (createResult.error) throw new Error(createResult.error);
      
      toast({
        title: `${storyData.priority.toUpperCase()} Story Injected`,
        description: `Added "${storyData.title}" (${storyData.estimatedPoints} SP) to ${sprintName}`,
      });
      
      setIsOpen(false);
      setQuery('');
      setSelectionMode(false);
      setPendingInjection(null);
      setPredictedMetadata(null);
      window.dispatchEvent(new Event('refresh-board'));
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Failed to Inject Story',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleInjectP0 = async () => {
    if (!query) return;
    setIsProcessing(true);
    
    try {
      // 1. AI Parse
      let storyData = predictedMetadata;
      if (!storyData) {
        const result = await parseP0CommandAction(query);
        if (!result.success) throw new Error(result.error || 'Failed to parse command');
        storyData = result.data;
      }
      
      const { targetSprintName } = storyData;

      // 2. Determine target sprint
      let finalSprintId = sprintIdFromUrl;
      let finalSprintName = activeSprint?.sprintName || 'Current Sprint';

      if (!finalSprintId) {
        // Try to match by name or number from AI
        if (operationalSprints.length > 0) {
          const match = operationalSprints.find(s => {
            const nameMatch = storyData.targetSprintName && s.name.toLowerCase().includes(storyData.targetSprintName.toLowerCase());
            const numberMatch = storyData.targetSprintNumber && s.sprint_number === storyData.targetSprintNumber;
            return nameMatch || numberMatch;
          });
          
          if (match) {
            finalSprintId = match.id;
            finalSprintName = match.name;
          }
        }

        // If still no ID and multiple options, enter selection mode
        if (!finalSprintId && operationalSprints.length > 1) {
          setPendingInjection(storyData);
          setSelectionMode(true);
          setSelectedIndex(0);
          setIsProcessing(false);
          return;
        }

        // Default to active sprint if only 1 or no match
        if (!finalSprintId) {
          finalSprintId = activeSprint?.id;
          finalSprintName = activeSprint?.sprintName;
        }
      }

      if (!finalSprintId) throw new Error('No active sprint found. Please create one first.');

      // 3. Create Story
      await completeStoryInjection(finalSprintId, finalSprintName, storyData);
      
    } catch (error: any) {
      toast({
        title: 'Failed to Inject Story',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[640px] bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-zinc-800/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] z-[9999] overflow-hidden"
          >
            <div className="p-6">
              <div className="relative group">
                <div className="absolute left-4 top-7 -translate-y-1/2">
                  {isProcessing ? (
                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                  ) : (
                    <Zap className="h-6 w-6 text-indigo-500" />
                  )}
                </div>
                <textarea
                  autoFocus
                  placeholder="Inject P0: Describe the critical issue..."
                  className="w-full min-h-[56px] max-h-[200px] py-4 pl-14 pr-20 bg-transparent text-xl font-medium outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none overflow-hidden"
                  rows={1}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    // Auto-resize
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (selectionMode) {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setSelectedIndex(prev => (prev + 1) % operationalSprints.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setSelectedIndex(prev => (prev - 1 + operationalSprints.length) % operationalSprints.length);
                      } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const target = operationalSprints[selectedIndex];
                        completeStoryInjection(target.id, target.name, pendingInjection);
                      } else if (e.key === 'Escape') {
                        setSelectionMode(false);
                        setPendingInjection(null);
                      }
                      return;
                    }
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleInjectP0();
                    }
                    if (e.key === 'Escape') setIsOpen(false);
                  }}
                />
                <div className="absolute right-4 top-7 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-bold text-zinc-500">
                    {selectionMode ? 'SELECT' : 'ENTER'}
                  </kbd>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {selectionMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 overflow-hidden"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="text-xs font-black uppercase tracking-widest text-indigo-500">Select Target Sprint</div>
                      <div className="text-[10px] text-zinc-400 font-bold">Use ↓ ↑ and Enter</div>
                    </div>
                    <div className="space-y-1">
                      {operationalSprints.map((sprint, idx) => (
                        <div
                          key={sprint.id}
                          onClick={() => completeStoryInjection(sprint.id, sprint.name, pendingInjection)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border",
                            selectedIndex === idx 
                              ? "bg-indigo-500/10 border-indigo-500/30 shadow-sm" 
                              : "bg-transparent border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              sprint.status === 'active' ? "bg-emerald-500" : "bg-blue-500"
                            )} />
                            <div className="flex flex-col">
                              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{sprint.name}</div>
                              <div className="text-[10px] font-medium text-zinc-500">Sprint {sprint.sprint_number}</div>
                            </div>
                          </div>
                          {selectedIndex === idx && (
                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Select</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="px-2 pb-2">
              <div className="rounded-2xl bg-zinc-50/50 dark:bg-black/20 p-2">
                <div className="px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Quiet AI Active</span>
                    {predictedMetadata && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        predictedMetadata.priority === 'critical' ? "bg-rose-500/10 text-rose-600 border border-rose-500/20" :
                        predictedMetadata.priority === 'high' ? "bg-orange-500/10 text-orange-600 border border-orange-500/20" :
                        predictedMetadata.priority === 'medium' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                        "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      )}>
                        {predictedMetadata.priority} • {predictedMetadata.estimatedPoints} SP
                      </motion.div>
                    )}
                  </div>
                  {activeSprint && !selectionMode && (
                    <div className="flex items-center gap-2 text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                      Target: {activeSprint.sprintName}
                    </div>
                  )}
                </div>

                {!selectionMode && (
                  <div className="mt-2 space-y-1">
                    <div 
                      onClick={handleInjectP0}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all",
                        query.length > 0 ? "bg-white dark:bg-zinc-800 shadow-sm border border-zinc-100 dark:border-zinc-700" : "opacity-50 grayscale pointer-events-none"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                          <AlertCircle className="h-5 w-5 text-rose-600" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">Inject P0 Priority Story</div>
                          <div className="text-xs text-zinc-500">Auto-points, auto-priority, instant board sync.</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-lg bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest">Command</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50/80 dark:bg-zinc-800/80 border-t border-zinc-100 dark:border-zinc-700 flex justify-center">
              <p className="text-[10px] text-zinc-400 font-medium">
                {selectionMode ? "Esc to cancel selection" : "Tip: You can mention a sprint name to auto-target it (e.g. 'in Q4')"}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
