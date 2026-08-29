"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { clsx } from "@/lib/clsx";
import { updateEventStatusAction } from "./actions";

type EventType = {
  id: string;
  title: string;
  status: string;
  startsAt: Date;
  location: string | null;
  assignments: {
    id: string;
    user: {
      name: string;
      avatarUrl: string | null;
    };
  }[];
};

const STATUSES = ["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"] as const;

export function BoardClient({
  initialEvents,
  canManage,
}: {
  initialEvents: EventType[];
  canManage: boolean;
}) {
  const [events, setEvents] = useState<EventType[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [activeMobileStatus, setActiveMobileStatus] = useState<string>("ALL");
  const [, startTransition] = useTransition();

  // Sync state if initialEvents changes from server revalidation
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const filteredEvents = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.location?.toLowerCase() || "").includes(q)
    );
  });

  const handleDragStart = (e: React.DragEvent, eventId: string) => {
    if (!canManage) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("eventId", eventId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    if (!canManage) return;
    e.preventDefault();
    
    const eventId = e.dataTransfer.getData("eventId");
    if (!eventId) return;

    const eventIndex = events.findIndex((ev) => ev.id === eventId);
    if (eventIndex === -1) return;
    
    const currentEvent = events[eventIndex];
    if (currentEvent.status === targetStatus) return; // No change

    // Optimistic UI update
    const newEvents = [...events];
    newEvents[eventIndex] = { ...currentEvent, status: targetStatus };
    setEvents(newEvents);

    // Persist to server
    startTransition(async () => {
      await updateEventStatusAction(eventId, targetStatus);
    });
  };

  const displayedStatuses = activeMobileStatus === "ALL"
    ? STATUSES
    : STATUSES.filter(s => s === activeMobileStatus);

  return (
    <div className="space-y-4 sm:space-y-6 flex flex-col min-h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] animate-slide-up">
      {/* Board Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between bg-surface/30 p-3 sm:p-4 rounded-xl border border-white/5">
        <div className="w-full sm:w-1/3">
          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all min-h-[40px]"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="text-xs text-white/50">
            {filteredEvents.length} Call{filteredEvents.length !== 1 && "s"}
          </div>
          {canManage && (
            <Link href="/coverages/new">
              <Button size="sm" className="h-9 px-3 text-xs font-semibold">New call</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Tab Filter (Quick Column Switching on Small Screens) */}
      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 -mx-3.5 px-3.5 custom-scrollbar">
        <button
          onClick={() => setActiveMobileStatus("ALL")}
          className={clsx(
            "px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors border",
            activeMobileStatus === "ALL"
              ? "bg-accent text-accent-foreground border-accent font-semibold"
              : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          All ({filteredEvents.length})
        </button>
        {STATUSES.map((status) => {
          const count = filteredEvents.filter(e => e.status === status).length;
          return (
            <button
              key={status}
              onClick={() => setActiveMobileStatus(status)}
              className={clsx(
                "px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors border",
                activeMobileStatus === status
                  ? "bg-accent text-accent-foreground border-accent font-semibold"
                  : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
              )}
            >
              {status} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board Container */}
      <div className="flex flex-1 overflow-x-auto overflow-y-hidden pb-4 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 gap-4 sm:gap-6 snap-x snap-mandatory">
        {displayedStatuses.map((status) => {
          const colEvents = filteredEvents.filter((e) => e.status === status);

          return (
            <div
              key={status}
              className="flex-shrink-0 w-[84vw] max-w-xs sm:w-80 bg-surface/20 border border-white/5 rounded-xl flex flex-col h-full snap-center"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="p-3 sm:p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-surface/80 backdrop-blur-md rounded-t-xl z-10">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs sm:text-sm font-bold text-white/90 uppercase tracking-wide">
                    {status}
                  </h3>
                  <span className="text-[11px] sm:text-xs font-semibold text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                    {colEvents.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5 sm:space-y-3 relative custom-scrollbar">
                {colEvents.map((event) => (
                  <Card
                    key={event.id}
                    draggable={canManage}
                    onDragStart={(e) => handleDragStart(e, event.id)}
                    className={clsx(
                      "p-3.5 sm:p-4 border-white/10 bg-surface/50 hover:bg-surface/80 transition-all relative group flex flex-col gap-2.5 sm:gap-3",
                      canManage ? "cursor-grab active:cursor-grabbing hover:border-white/20 hover:shadow-lg" : ""
                    )}
                  >
                    {/* Title */}
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/coverages/${event.id}`} className="block flex-1 group-hover:text-accent transition-colors">
                        <h4 className="font-semibold text-xs sm:text-sm leading-snug line-clamp-2 text-white/90">
                          {event.title}
                        </h4>
                      </Link>
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="w-max max-w-full truncate rounded-md bg-white/5 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white/60">
                        {event.location}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-0.5 pt-2.5 sm:pt-3 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] sm:text-[10px] text-white/30 font-mono" title="Task ID">
                          #{event.id.slice(10, 15).toUpperCase()}
                        </span>
                        
                        <div className="flex items-center text-[10px] sm:text-[11px] font-medium text-white/50" title="Start Time">
                          <svg className="mr-1 w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          {new Date(event.startsAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>

                      {/* Assignees */}
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {event.assignments.slice(0, 3).map((a) => (
                          <div 
                            key={a.id} 
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-surface bg-surface"
                            title={a.user.name}
                          >
                            {a.user.avatarUrl ? (
                              <img src={a.user.avatarUrl} alt={a.user.name} className="h-full w-full rounded-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center rounded-full bg-accent/20 text-[9px] font-bold text-accent">
                                {a.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        ))}
                        {event.assignments.length > 3 && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-surface bg-white/10 text-[9px] font-bold text-white/70">
                            +{event.assignments.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
                
                {colEvents.length === 0 && (
                  <div className="p-8 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs font-medium pointer-events-none">
                    No calls in this column
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
