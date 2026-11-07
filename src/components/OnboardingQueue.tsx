import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Building2,
  Clock,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Users,
} from 'lucide-react';
import { OnboardingQueueItem, SubscriptionTier } from '@/types';
import { OnboardingReviewModal } from './OnboardingReviewModal';

interface OnboardingQueueProps {
  queue: OnboardingQueueItem[];
  isLoading: boolean;
  onApprove: (id: string, options: {
    initialPlan: SubscriptionTier;
    trialDays: number;
    customRate?: number;
  }) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRefresh: () => void;
}

export const OnboardingQueue: React.FC<OnboardingQueueProps> = ({
  queue,
  isLoading,
  onApprove,
  onReject,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedSchool, setSelectedSchool] = useState<OnboardingQueueItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Derive unique states
  const states = useMemo(() => {
    const set = new Set<string>();
    queue.forEach((item) => {
      if (item.state) set.add(item.state);
    });
    return Array.from(set).sort();
  }, [queue]);

  // Filtered Queue
  const filteredQueue = useMemo(() => {
    return queue.filter((item) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        item.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesState =
        selectedState === 'ALL' || (item.state && item.state.toLowerCase() === selectedState.toLowerCase());

      return matchesSearch && matchesState;
    });
  }, [queue, searchTerm, selectedState]);

  const handleOpenReview = (school: OnboardingQueueItem) => {
    setSelectedSchool(school);
    setIsModalOpen(true);
  };

  const totalProposedStudents = useMemo(() => {
    return queue.reduce((acc, curr) => acc + (curr.proposedStudentPopulation || 0), 0);
  }, [queue]);

  return (
    <div className="space-y-4">
      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                Pending Approvals
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                {queue.length}
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5" />
                Schools awaiting gating verification
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                Pipeline Capacity
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                ~{totalProposedStudents.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5" />
                Proposed student seats
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider">
                Verification SLA
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-mono">
                &lt; 2-4 hrs
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Hardened Multi-Tenant Security
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm transition-colors">
        {/* Table Header & Controls */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Onboarding Review Queue</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 font-mono">
                {filteredQueue.length} Pending
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review self-registered school accounts, configure subscription terms, and activate workspaces.
            </p>
          </div>

          {/* Search & State Filter */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search school, admin, email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none font-medium cursor-pointer"
              >
                <option value="ALL">All States</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="Refresh Queue"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">School & Subdomain</th>
                <th className="py-3 px-3">State / City</th>
                <th className="py-3 px-3">Contact Person</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Registered</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-mono">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading onboarding queue...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">All Clear — No Pending Approvals</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                        All school registrations have been reviewed. New tenant registrations will automatically arrive here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* School Name & Subdomain */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 text-xs">
                          {item.schoolName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white text-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {item.schoolName}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                            {item.slug}.schola.xyz
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* State / Location */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-medium truncate text-xs">{item.state || 'Unspecified'}</span>
                      </div>
                      {item.city && (
                        <p className="text-[10px] text-slate-400 pl-4.5 truncate">{item.city}</p>
                      )}
                    </td>

                    {/* Contact Person */}
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 text-xs">
                      {item.fullname}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-3">
                      <a
                        href={`mailto:${item.email}`}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-mono text-[11px]"
                      >
                        {item.email}
                      </a>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                      {item.phone}
                    </td>

                    {/* Registered Date */}
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenReview(item)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-medium text-xs shadow-sm transition-all"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <OnboardingReviewModal
        school={selectedSchool}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
};

