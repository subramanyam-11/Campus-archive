import React, { useState } from 'react';
import { ViewType } from '../types';

interface ReportsViewProps {
  onNavigate: (view: ViewType) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ onNavigate }) => {
  const [selectedAy, setSelectedAy] = useState('AY 2024–25');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = (format: string) => {
    setShowExportMenu(false);
    showToast(`Generating ${format} report according to NAAC/NBA compliance guidelines...`);
  };

  return (
    <div className="px-4 lg:px-gutter-desktop py-space-lg flex flex-col gap-space-lg max-w-7xl mx-auto w-full pb-16">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Context & Header */}
      <div className="flex flex-col gap-space-xs pb-space-xs border-b border-outline-variant/30">
        <div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm">
          <span>Administrative Console</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-primary font-semibold">Compliance &amp; Reports</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
          <div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-semibold text-headline-lg text-on-surface tracking-tight">
                Statutory Reports &amp; Institutional Analytics
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold uppercase tracking-wider">
                Admin Exclusive
              </span>
            </div>
            <p className="text-body-md text-on-surface-variant mt-0.5">
              AQAR, NAAC SSR Metric collation, and committee performance metrics
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <div className="relative">
              <select
                value={selectedAy}
                onChange={(e) => setSelectedAy(e.target.value)}
                aria-label="Select Academic Year"
                className="h-9 pl-3 pr-8 rounded-lg bg-surface-container-lowest text-on-surface text-label-md font-semibold appearance-none cursor-pointer border border-outline-variant/40 focus:outline-none focus:bg-surface-container-low shadow-sm"
              >
                <option>AY 2024–25</option>
                <option>AY 2023–24</option>
                <option>AY 2022–23</option>
                <option>AY 2021–22</option>
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                expand_more
              </span>
            </div>

            {/* Split Export Button */}
            <div className="relative inline-flex rounded-lg overflow-visible shadow-sm">
              <button
                onClick={() => handleDownload('Consolidated Institutional Report')}
                className="h-9 px-space-md bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold flex items-center gap-space-xs transition-colors rounded-l-lg"
              >
                <span className="material-symbols-outlined text-[18px]">sim_card_download</span>
                <span>Export Consolidated Report</span>
              </button>
              <button
                aria-label="Toggle export options"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="h-9 px-2 bg-primary-container hover:bg-primary text-on-primary transition-colors flex items-center justify-center rounded-r-lg border-l border-white/20"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_drop_down</span>
              </button>

              {/* Export Menu Popover */}
              {showExportMenu && (
                <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-xl py-1 z-30 animate-in fade-in duration-100">
                  <button
                    onClick={() => handleDownload('CSV (.xlsx/.csv)')}
                    className="w-full px-space-md py-2 text-left text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-space-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-secondary text-[18px]">table_view</span>
                    <span>Export CSV (.xlsx/.csv)</span>
                  </button>
                  <button
                    onClick={() => handleDownload('PDF (NAAC Format)')}
                    className="w-full px-space-md py-2 text-left text-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-space-sm transition-colors"
                  >
                    <span className="material-symbols-outlined text-error text-[18px]">picture_as_pdf</span>
                    <span>Export PDF (NAAC Format)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row of 3 Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
        {/* Card 1 */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-md text-on-surface-variant font-medium">Total Archived Events</span>
            <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-space-xs">
              <span className="text-headline-xl text-on-surface font-bold tracking-tight">142</span>
              <span className="text-[12px] text-secondary font-semibold">Events</span>
            </div>
            <div className="flex items-center gap-1.5 mt-space-xs">
              <span className="material-symbols-outlined text-[16px] text-tertiary">trending_up</span>
              <p className="text-[11px] text-on-surface-variant">
                +18% YoY volume, <span className="font-semibold text-tertiary">100% indexed</span>
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-md text-on-surface-variant font-medium">Pending Approvals</span>
            <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-space-xs">
              <span className="text-headline-xl text-on-surface font-bold tracking-tight">07</span>
              <span className="text-[12px] text-outline font-semibold">Requires Sign-off</span>
            </div>
            <div className="flex items-center gap-1.5 mt-space-xs">
              <span className="w-2 h-2 rounded-full bg-secondary-container shrink-0"></span>
              <p className="text-[11px] text-on-surface-variant">4 Dean level, 3 Faculty Advisor level</p>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-space-lg rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-label-md text-on-surface-variant font-medium">Overdue Reports (ATR)</span>
            <div className="w-9 h-9 rounded-lg bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]">notification_important</span>
            </div>
          </div>
          <div className="mt-space-sm">
            <div className="flex items-baseline gap-space-xs">
              <span className="text-headline-xl text-on-surface font-bold tracking-tight">03</span>
              <span className="text-[12px] text-error font-semibold">&gt; 15 days</span>
            </div>
            <div className="flex items-center gap-1.5 mt-space-xs">
              <span className="w-2 h-2 rounded-full bg-error shrink-0"></span>
              <p className="text-[11px] text-error font-semibold">Requires HOD compliance notice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid (Balanced 2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Left Column: Event Distribution by Organizing Committee */}
        <div className="lg:col-span-7 flex flex-col rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm overflow-hidden">
          <div className="p-space-lg flex items-center justify-between bg-surface-container-lowest border-b border-outline-variant/20">
            <div>
              <h2 className="font-semibold text-headline-md text-on-surface">
                Event Distribution by Organizing Committee
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                AY 2024–25 Committee performance &amp; budget allocation metric
              </p>
            </div>
            <button
              onClick={() => onNavigate('events')}
              className="text-label-sm text-primary flex items-center gap-1 hover:underline font-semibold"
            >
              <span>Audit View</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold border-b border-outline-variant/30">
                <tr>
                  <th className="py-2.5 px-space-lg">Committee</th>
                  <th className="py-2.5 px-space-md text-center">Events</th>
                  <th className="py-2.5 px-space-md">Budget</th>
                  <th className="py-2.5 px-space-lg">ATR Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 text-on-surface">
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                      <div>
                        <div className="font-semibold text-on-surface">ACM Student Chapter</div>
                        <div className="text-[11px] text-on-surface-variant">Dept of CSE</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-bold">18</td>
                  <td className="py-3 px-space-md font-mono font-semibold text-on-surface">₹ 2.4L</td>
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-label-sm text-tertiary font-bold shrink-0">100%</span>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                      <div>
                        <div className="font-semibold text-on-surface">IEEE PES Chapter</div>
                        <div className="text-[11px] text-on-surface-variant">Dept of EEE</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-bold">14</td>
                  <td className="py-3 px-space-md font-mono font-semibold text-on-surface">₹ 1.9L</td>
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-label-sm text-tertiary font-bold shrink-0">100%</span>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2 h-2 rounded-full bg-primary-container shrink-0"></span>
                      <div>
                        <div className="font-semibold text-on-surface">Central NSS Unit</div>
                        <div className="text-[11px] text-on-surface-variant">Student Affairs Council</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-bold">24</td>
                  <td className="py-3 px-space-md font-mono font-semibold text-on-surface">₹ 1.2L</td>
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '96%' }}></div>
                      </div>
                      <span className="text-label-sm text-on-surface font-semibold shrink-0">96%</span>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2 h-2 rounded-full bg-on-tertiary-fixed-variant shrink-0"></span>
                      <div>
                        <div className="font-semibold text-on-surface">Robotics Guild</div>
                        <div className="text-[11px] text-on-surface-variant">Dept of Mechatronics</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-bold">12</td>
                  <td className="py-3 px-space-md font-mono font-semibold text-on-surface">₹ 2.8L</td>
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: '92%' }}></div>
                      </div>
                      <span className="text-label-sm text-on-surface font-semibold shrink-0">92%</span>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2 h-2 rounded-full bg-secondary-container shrink-0"></span>
                      <div>
                        <div className="font-semibold text-on-surface">IPR &amp; Entrepreneurship</div>
                        <div className="text-[11px] text-on-surface-variant">R&amp;D Cell</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-bold">10</td>
                  <td className="py-3 px-space-md font-mono font-semibold text-on-surface">₹ 1.5L</td>
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                        <div className="bg-tertiary h-full rounded-full" style={{ width: '100%' }}></div>
                      </div>
                      <span className="text-label-sm text-tertiary font-bold shrink-0">100%</span>
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim shrink-0"></span>
                      <div>
                        <div className="font-semibold text-on-surface">Sports &amp; Cultural Council</div>
                        <div className="text-[11px] text-on-surface-variant">General Administration</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-center font-bold">32</td>
                  <td className="py-3 px-space-md font-mono font-semibold text-on-surface">₹ 3.6L</td>
                  <td className="py-3 px-space-lg">
                    <div className="flex items-center gap-space-sm">
                      <div className="flex-1 bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                        <div className="bg-secondary-container h-full rounded-full" style={{ width: '88%' }}></div>
                      </div>
                      <span className="text-label-sm text-secondary font-bold shrink-0">88%</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-space-md bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between mt-auto">
            <span className="text-[11px] text-on-surface-variant">Aggregate 6 committees audited</span>
            <span className="text-label-sm text-on-surface font-semibold">110 of 142 total events accounted</span>
          </div>
        </div>

        {/* Right Column: Multi-Year Event & Budget Trajectory */}
        <div className="lg:col-span-5 flex flex-col rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm">
          <div className="p-space-lg flex items-center justify-between border-b border-outline-variant/20">
            <div>
              <h2 className="font-semibold text-headline-md text-on-surface">
                Multi-Year Event &amp; Budget Trajectory
              </h2>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Historical breakdown &amp; continuous trend</p>
            </div>
            <span className="material-symbols-outlined text-outline text-[20px]">monitoring</span>
          </div>

          {/* Trend Visualization */}
          <div className="px-space-lg pt-space-md pb-space-sm">
            <div className="p-space-md rounded-lg bg-surface border border-outline-variant/30 flex flex-col gap-space-xs">
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>Sanctioned Budget (in Lakhs INR)</span>
                <span className="font-semibold text-primary">₹38.4L Current Run-rate</span>
              </div>
              <div className="h-24 w-full flex items-end justify-between gap-3 pt-2">
                <div className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-surface-container-high rounded-t group-hover:bg-primary-container transition-all" style={{ height: '52px' }}></div>
                  <span className="text-[10px] text-outline font-medium">21-22</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-surface-container-high rounded-t group-hover:bg-primary-container transition-all" style={{ height: '64px' }}></div>
                  <span className="text-[10px] text-outline font-medium">22-23</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-surface-container-high rounded-t group-hover:bg-primary-container transition-all" style={{ height: '72px' }}></div>
                  <span className="text-[10px] text-outline font-medium">23-24</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full bg-primary rounded-t transition-all shadow-sm" style={{ height: '68px' }}></div>
                  <span className="text-[10px] text-primary font-bold">24-25</span>
                </div>
              </div>
            </div>
          </div>

          {/* Year-over-year Comparison List */}
          <div className="px-space-lg pb-space-lg flex flex-col gap-space-xs">
            {/* AY 2024-25 */}
            <div className="p-space-sm rounded-lg bg-surface-container-low border border-outline-variant/30 flex flex-col gap-1 hover:bg-surface-container transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-label-md text-on-surface">AY 2024–25</span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-container text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  In Progress
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>142 Events • ₹ 38.4L</span>
                <span className="font-semibold text-on-surface">ATR: 94.2%</span>
              </div>
            </div>

            {/* AY 2023-24 */}
            <div className="p-space-sm rounded-lg border border-transparent hover:bg-surface transition-colors flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-label-md text-on-surface">AY 2023–24</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-tertiary text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Archived &amp; Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>168 Events • ₹ 42.1L</span>
                <span className="font-semibold text-on-surface">ATR: 99.1%</span>
              </div>
            </div>

            {/* AY 2022-23 */}
            <div className="p-space-sm rounded-lg border border-transparent hover:bg-surface transition-colors flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-label-md text-on-surface">AY 2022–23</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-tertiary text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Archived &amp; Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>154 Events • ₹ 36.8L</span>
                <span className="font-semibold text-tertiary">ATR: 100%</span>
              </div>
            </div>

            {/* AY 2021-22 */}
            <div className="p-space-sm rounded-lg border border-transparent hover:bg-surface transition-colors flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-label-md text-on-surface">AY 2021–22</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container text-tertiary text-[11px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Archived &amp; Verified
                </span>
              </div>
              <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
                <span>128 Events • ₹ 29.5L</span>
                <span className="font-semibold text-tertiary">ATR: 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Card: Statutory Compliance & Accreditation Readiness */}
      <div className="rounded-xl bg-surface-container-lowest border border-outline-variant/40 shadow-sm p-space-lg flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
        <div className="flex-1 flex flex-col gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
            <h3 className="font-semibold text-headline-sm text-on-surface">
              Statutory Compliance &amp; Accreditation Readiness
            </h3>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            Auto-validated criteria mapped to current NAAC SSR Manual guidelines. All indices meet standard qualifying thresholds.
          </p>

          {/* Metric Badges Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
            {/* Metric 3.3.2 */}
            <div className="p-space-md rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-label-sm text-on-surface">
                  Metric 3.3.2 (Seminars/Workshops)
                </span>
                <span className="text-[11px] text-on-surface-variant">48 Conducted (Mandated Target: 40)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold flex items-center gap-1 border border-tertiary/20">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                100% Ready
              </span>
            </div>

            {/* Metric 5.3.2 */}
            <div className="p-space-md rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-semibold text-label-sm text-on-surface">
                  Metric 5.3.2 (Student Events &amp; Sports)
                </span>
                <span className="text-[11px] text-on-surface-variant">62 Conducted (Mandated Target: 50)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-bold flex items-center gap-1 border border-tertiary/20">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                100% Ready
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action / Download Button */}
        <div className="shrink-0 flex flex-col justify-center">
          <button
            onClick={() => handleDownload('NAAC SSR Formatted Appendix (PDF)')}
            className="h-10 px-space-lg rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-label-md font-semibold flex items-center gap-space-sm border border-outline-variant/40 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">download</span>
            <span>Download NAAC SSR Formatted Appendix (PDF)</span>
          </button>
          <span className="text-[11px] text-outline text-center mt-1.5">
            Includes digital signatures &amp; geotagged logs
          </span>
        </div>
      </div>
    </div>
  );
};
