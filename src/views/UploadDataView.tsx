'use client';

import React, { useState } from 'react';
import { StagingItem, ViewType } from '../types';
import { INITIAL_STAGING_ITEMS } from '../data/mockData';
import { computeFileSha256 } from '@/lib/crypto/hash';

interface UploadDataViewProps {
  onNavigate: (view: ViewType) => void;
  onImportComplete: (itemsCount: number) => void;
}

export const UploadDataView: React.FC<UploadDataViewProps> = ({ onNavigate, onImportComplete }) => {
  const [stagingQueue, setStagingQueue] = useState<StagingItem[]>(INITIAL_STAGING_ITEMS);
  const [filterMode, setFilterMode] = useState<'all' | 'needs-review'>('all');
  const [isIngesting, setIsIngesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectAll = (checked: boolean) => {
    setStagingQueue((prev) => prev.map((item) => ({ ...item, selected: checked })));
  };

  const handleToggleRow = (id: string) => {
    setStagingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleCommitteeChange = (id: string, newComm: string) => {
    setStagingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, detectedCommittee: newComm } : item))
    );
  };

  const handleYearChange = (id: string, newYear: string) => {
    setStagingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, academicYear: newYear } : item))
    );
  };

  const handleTitleChange = (id: string, newTitle: string) => {
    setStagingQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, recordTitle: newTitle } : item))
    );
  };

  const handleDiscardSelected = () => {
    const selectedCount = stagingQueue.filter((i) => i.selected).length;
    if (selectedCount === 0) {
      showToast('No items selected to discard.');
      return;
    }
    setStagingQueue((prev) => prev.filter((i) => !i.selected));
    showToast(`Discarded ${selectedCount} staging items.`);
  };

  const handleImportToArchive = () => {
    const selectedCount = stagingQueue.filter((i) => i.selected).length;
    if (selectedCount === 0) return;

    setIsIngesting(true);
    setTimeout(() => {
      setIsIngesting(false);
      setIsSuccess(true);
      showToast(`Successfully imported ${selectedCount} archives into Institutional Master Ledger!`);
      onImportComplete(selectedCount);
      setTimeout(() => {
        setIsSuccess(false);
        onNavigate('archive-and-search');
      }, 1500);
    }, 1200);
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsHashing(true);
    showToast(`Computing SHA-256 cryptographic hashes for ${fileArray.length} file(s)...`);

    try {
      const existingHashes = new Set(
        stagingQueue
          .map((i) => i.sha256Hash?.toLowerCase())
          .filter(Boolean)
      );

      const newItems: StagingItem[] = [];

      for (let idx = 0; idx < fileArray.length; idx++) {
        const file = fileArray[idx];
        const hash = await computeFileSha256(file);
        const isDuplicate = existingHashes.has(hash.toLowerCase());

        newItems.push({
          id: `new-${stagingQueue.length + idx + 1}`,
          fileName: file.name,
          innerDocsCount: isDuplicate
            ? 'Duplicate detected! SHA-256 collision'
            : 'Extracted documents via client de-serializer',
          detectedCommittee: 'ACM Student Chapter',
          academicYear: 'AY 2024–25',
          recordTitle: file.name.replace(/\.[^/.]+$/, ''),
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
          status: isDuplicate ? 'Needs Review' : 'Auto-Mapped',
          confidenceScore: isDuplicate ? 0 : 94,
          confidence: isDuplicate ? 'Duplicate (0%)' : 'High (94%)',
          selected: !isDuplicate,
          notes: isDuplicate
            ? 'DUPLICATE: Identical SHA-256 hash already exists in repository.'
            : 'Verified cryptographic SHA-256 fingerprint.',
          sha256Hash: hash,
        });

        existingHashes.add(hash.toLowerCase());
      }

      setStagingQueue((prev) => [...newItems, ...prev]);
      const dups = newItems.filter((i) => i.status === 'Needs Review').length;
      if (dups > 0) {
        showToast(`Ingested ${newItems.length} file(s) (${dups} flagged as duplicate).`);
      } else {
        showToast(`Successfully processed & verified ${newItems.length} file(s).`);
      }
    } catch (err) {
      console.error('Hashing error:', err);
      showToast('Error calculating cryptographic hashes for uploaded files.');
    } finally {
      setIsHashing(false);
    }
  };

  const handleBrowseFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.zip,.csv,.xlsx,.pdf,.docx';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        processFiles(files);
      }
    };
    input.click();
  };

  const displayedItems = filterMode === 'all'
    ? stagingQueue
    : stagingQueue.filter((i) => i.status === 'Needs Review');

  const selectedCount = stagingQueue.filter((i) => i.selected).length;

  return (
    <div className="flex flex-col w-full pb-24">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-label-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="material-symbols-outlined text-tertiary-fixed text-[18px]">verified</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Ingestion Wrapper */}
      <div className="p-4 lg:p-gutter-desktop max-w-[1440px] mx-auto w-full flex flex-col gap-space-lg">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-sm pb-space-sm border-b border-outline-variant/30">
          <div className="flex flex-col">
            <h1 className="font-semibold text-headline-lg text-on-surface tracking-tight">
              Upload &amp; Migrate Data
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              Batch import legacy archives, committee dossiers, photographic proof, and historical rosters into the institutional repository.
            </p>
          </div>

          <div className="flex items-center gap-space-xs self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-primary text-label-sm font-semibold border border-outline-variant/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Ingestion Pipeline: Online
            </span>
            <button
              onClick={() => setShowGuideModal(true)}
              className="h-8 px-3 rounded bg-surface-container-lowest border border-outline-variant/50 hover:bg-surface-container-low text-on-surface text-label-sm inline-flex items-center gap-1.5 transition-colors font-medium shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px] text-outline">help_outline</span>
              <span>Migration Guide</span>
            </button>
          </div>
        </div>

        {/* Section 1: Drag-and-Drop Ingestion Zone */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-space-lg flex flex-col gap-space-md shadow-sm">
          <div
            onClick={handleBrowseFiles}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files) {
                processFiles(e.dataTransfer.files);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${
              isDragging
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-outline-variant hover:border-primary bg-surface hover:bg-surface-container-low/50'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-transform mb-3 shadow-sm ${
              isHashing ? 'bg-primary text-on-primary animate-spin' : 'bg-surface-container-high text-primary group-hover:scale-105'
            }`}>
              <span className="material-symbols-outlined text-[30px]">
                {isHashing ? 'sync' : 'cloud_upload'}
              </span>
            </div>
            <h3 className="font-semibold text-headline-sm text-on-surface">
              {isHashing
                ? 'Calculating SHA-256 hashes & checking deduplication ledger...'
                : isDragging
                ? 'Drop archives here to begin cryptographic verification...'
                : 'Drag and drop historical folders, ZIP archives, or CSV/PDF spreadsheets here'}
            </h3>
            <p className="text-body-sm text-on-surface-variant max-w-xl mt-1 mb-4">
              Supports <strong className="text-on-surface font-semibold">.zip, .csv, .xlsx, .pdf, .docx</strong> up to 250MB per batch. Automatically verifies SHA-256 hash deduplication against existing institutional archives.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-sm">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseFiles();
                }}
                disabled={isHashing}
                className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-semibold inline-flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">folder_open</span>
                <span>Browse Files from Computer</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  showToast('Connecting to Institutional Nextcloud / SMB storage mount...');
                }}
                className="h-9 px-3 rounded-lg bg-transparent hover:bg-surface-container text-primary text-label-md font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">lan</span>
                <span>or connect network drive / institutional cloud</span>
              </button>
            </div>
          </div>

          {/* Upload Status Banner */}
          <div className="rounded-lg bg-surface-container-low border border-outline-variant/40 p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-body-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined text-[20px]">folder_zip</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-semibold text-label-md text-on-surface">
                  {stagingQueue.length} archive files uploaded
                </span>
                <span className="text-outline text-[11px]">•</span>
                <span className="text-on-surface-variant font-mono text-[12px] bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30">
                  AY2023_Events_Bundle.zip
                </span>
                <span className="text-outline text-[11px]">•</span>
                <span className="text-tertiary text-label-sm font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Extraction complete
                </span>
                <span className="text-outline text-[11px]">•</span>
                <span className="text-secondary text-label-sm font-semibold">OCR Parser Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => setShowLogModal(true)}
                className="text-primary hover:underline text-label-sm font-semibold flex items-center gap-1"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">history_edu</span>
                <span>View Extraction Log</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Extracted Staging Queue */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 flex flex-col overflow-hidden shadow-sm">
          {/* Section Toolbar Header */}
          <div className="p-space-md border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-container-lowest">
            <div className="flex items-center gap-space-sm">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">queue</span>
                <h2 className="font-semibold text-headline-md text-on-surface">Extracted Staging Queue</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary text-[11px] font-bold">
                {displayedItems.length} items ready for ingest
              </span>
            </div>

            {/* Filter Pills & Batch Operations */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterMode('all')}
                className={`h-7 px-2.5 rounded text-label-sm flex items-center gap-1 font-semibold transition-colors ${
                  filterMode === 'all'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span>All Records</span>
                <span className="bg-white/20 text-on-primary px-1 rounded text-[10px] font-mono">
                  {stagingQueue.length}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('needs-review')}
                className={`h-7 px-2.5 rounded text-label-sm flex items-center gap-1 font-semibold transition-colors ${
                  filterMode === 'needs-review'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                <span>Needs Review</span>
                <span className="bg-amber-200 text-amber-900 px-1 rounded text-[10px] font-mono">
                  {stagingQueue.filter((i) => i.status === 'Needs Review').length}
                </span>
              </button>

              <div className="h-4 w-px bg-outline-variant/40 mx-1"></div>

              <button
                onClick={() => showToast('Bulk categorization heuristic applied to selected rows.')}
                className="h-7 px-2 rounded bg-surface border border-outline-variant/50 hover:bg-surface-container-low text-on-surface-variant text-label-sm flex items-center gap-1 font-medium transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Apply Bulk Rule</span>
              </button>

              <button
                onClick={() => showToast('Re-running neural OCR parser on staging queue...')}
                className="h-7 px-2 rounded bg-surface border border-outline-variant/50 hover:bg-surface-container-low text-on-surface-variant text-label-sm flex items-center gap-1 font-medium transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Re-run OCR</span>
              </button>
            </div>
          </div>

          {/* Data Table Area */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-outline-variant/40 text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold h-10 select-none">
                  <th className="w-10 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCount === displayedItems.length && displayedItems.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2 min-w-[240px]">Detected Source &amp; Payload</th>
                  <th className="px-3 py-2 min-w-[210px]">Detected Committee</th>
                  <th className="px-3 py-2 min-w-[130px]">Academic Year</th>
                  <th className="px-3 py-2 min-w-[240px]">Designated Record / Title</th>
                  <th className="px-3 py-2 min-w-[110px]">Size / Payload</th>
                  <th className="px-3 py-2 min-w-[120px]">Mapping Status</th>
                  <th className="w-12 px-3 py-2 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-body-sm text-on-surface">
                {displayedItems.map((item) => (
                  <tr
                    key={item.id}
                    className={`hover:bg-surface-container-low/60 transition-colors group ${
                      item.status === 'Needs Review' ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    <td className="px-3 text-center">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => handleToggleRow(item.id)}
                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                            item.type === 'ZIP'
                              ? 'bg-primary/10 text-primary'
                              : item.type === 'PDF'
                              ? 'bg-error-container text-error'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {item.type === 'ZIP' ? 'folder_zip' : item.type === 'PDF' ? 'picture_as_pdf' : 'table_chart'}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-label-md text-on-surface truncate">
                            {item.fileName}
                          </span>
                          <span
                            className={`text-[11px] flex items-center gap-1 ${
                              item.status === 'Needs Review' ? 'text-amber-800 font-semibold' : 'text-on-surface-variant'
                            }`}
                          >
                            {item.status === 'Needs Review' ? (
                              <span className="material-symbols-outlined text-[13px] text-amber-600">warning</span>
                            ) : (
                              <span className="material-symbols-outlined text-[13px] text-outline">description</span>
                            )}
                            {item.innerDocsCount}
                          </span>
                          {item.sha256Hash && (
                            <span className="text-[10px] font-mono text-outline flex items-center gap-1 mt-0.5" title={item.sha256Hash}>
                              <span className="material-symbols-outlined text-[12px] text-primary">fingerprint</span>
                              <span className="truncate max-w-[200px]">{item.sha256Hash.slice(0, 16)}...</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="relative">
                        <select
                          value={item.detectedCommittee}
                          onChange={(e) => handleCommitteeChange(item.id, e.target.value)}
                          className={`w-full h-8 pl-2.5 pr-7 text-body-sm bg-surface rounded border text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer ${
                            item.status === 'Needs Review' ? 'border-amber-300' : 'border-outline-variant/50'
                          }`}
                        >
                          <option>Robotics &amp; Automation Guild</option>
                          <option>Central NSS Unit</option>
                          <option>IEEE PES Student Chapter</option>
                          <option>Cultural Affairs Council</option>
                          <option>ACM Student Chapter</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                          expand_more
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="relative">
                        <select
                          value={item.academicYear}
                          onChange={(e) => handleYearChange(item.id, e.target.value)}
                          className={`w-full h-8 pl-2 pr-6 text-body-sm bg-surface rounded border text-on-surface focus:outline-none focus:border-primary appearance-none cursor-pointer ${
                            item.status === 'Needs Review' ? 'border-amber-300' : 'border-outline-variant/50'
                          }`}
                        >
                          <option>AY 2024–25</option>
                          <option>AY 2023–24</option>
                          <option>AY 2022–23</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                          expand_more
                        </span>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={item.recordTitle}
                        onChange={(e) => handleTitleChange(item.id, e.target.value)}
                        className="w-full h-8 px-2.5 text-body-sm bg-surface rounded border border-outline-variant/50 text-on-surface focus:outline-none focus:border-primary"
                      />
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-on-surface-variant text-[12px] font-mono">
                      {item.size}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      {item.status === 'Auto-Mapped' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          Auto-Mapped
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 text-label-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                          Needs Review
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => showToast(`Inspecting inner manifest for ${item.fileName}`)}
                        className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                        title="Inspect inner extracted files"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Bottom Helper Note */}
          <div className="p-3 bg-surface border-t border-outline-variant/30 flex items-center justify-between text-body-sm flex-wrap gap-2">
            <div className="flex items-center gap-2 text-on-surface-variant text-[11px]">
              <span className="material-symbols-outlined text-[16px] text-outline">info</span>
              <span>
                Double check classifications: System auto-mapped 2 files via official signature headers and 1 via flyer typography analysis. Staged in local cache.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-outline">
              <span>Staged Payload Size: 45.4 MB</span>
              <span>•</span>
              <span>Target Database: Institutional Main Ledger v4.2</span>
            </div>
          </div>
        </div>

        {/* Section 3: Metadata Ingestion Preview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                <span className="font-semibold text-label-md text-on-surface">Auto-Categorization Rules</span>
                <span className="material-symbols-outlined text-outline text-[18px]">schema</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Rule engine matches extracted patron names, Dean approval letterheads, and financial sanction seal patterns with 98.4% precision.
              </p>
            </div>
            <span className="text-[11px] text-primary font-bold mt-3 inline-flex items-center gap-1">
              Active heuristics applied (3 rules)
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                <span className="font-semibold text-label-md text-on-surface">Checksum &amp; Integrity</span>
                <span className="material-symbols-outlined text-outline text-[18px]">verified_user</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                SHA-256 digests calculated upon ingest. All 3 staging archives passed byte validation without corruption or missing binary blocks.
              </p>
            </div>
            <span className="text-[11px] text-tertiary font-bold mt-3 inline-flex items-center gap-1">
              Integrity status: 100% verified
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20">
                <span className="font-semibold text-label-md text-on-surface">Access Tier &amp; Permissions</span>
                <span className="material-symbols-outlined text-outline text-[18px]">lock_open</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Target visibility defaulted to <strong className="text-on-surface font-semibold">Institutional Public Access</strong> with high-res event photography available to campus delegates.
              </p>
            </div>
            <span className="text-[11px] text-outline mt-3 inline-flex items-center gap-1 font-medium">
              Role: Admin &amp; Committee Chair Read/Write
            </span>
          </div>
        </div>
      </div>

      {/* Section 4: Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-surface-container-lowest border-t border-outline-variant/40 py-3 px-4 lg:px-gutter-desktop z-30 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></div>
            <span className="text-label-md text-on-surface">
              <strong className="font-semibold text-on-surface">{selectedCount} items selected for ingestion</strong> • 0 errors detected • Ready to write to immutable academic ledger
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
            <button
              onClick={handleDiscardSelected}
              className="h-9 px-4 rounded-lg bg-surface-container-lowest border border-outline-variant/50 hover:bg-error/5 hover:border-error/30 text-error text-label-md font-medium inline-flex items-center gap-1.5 transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              <span>Discard Selected</span>
            </button>

            <button
              onClick={handleImportToArchive}
              disabled={selectedCount === 0 || isIngesting}
              className={`h-9 px-5 rounded-lg text-on-primary text-label-md font-semibold inline-flex items-center gap-2 transition-all shadow-sm ${
                isSuccess
                  ? 'bg-emerald-700'
                  : selectedCount === 0
                  ? 'bg-primary/50 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary-container active:bg-primary'
              }`}
              type="button"
            >
              {isIngesting ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Ingesting records...</span>
                </>
              ) : isSuccess ? (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Successfully Imported!</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cloud_done</span>
                  <span>Confirm &amp; Import to Archive</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Extraction Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-semibold text-headline-sm text-on-surface">Extraction &amp; De-serialization Log</h3>
              <button onClick={() => setShowLogModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="bg-slate-950 text-slate-100 p-4 rounded-lg font-mono text-[12px] space-y-1.5 max-h-60 overflow-y-auto">
              <div className="text-emerald-400">[10:12:01] Archive AY2023_Events_Bundle.zip unpacked successfully</div>
              <div>[10:12:02] Identified 14 nested sub-artifacts (PDFs, JPEGs)</div>
              <div>[10:12:03] Neural OCR model loaded (v2.4)</div>
              <div className="text-emerald-400">[10:12:04] RoboForge Hackathon extracted with 94% confidence</div>
              <div>[10:12:05] Central NSS Unit roster verified (82 rows)</div>
              <div className="text-amber-400">[10:12:06] Warning: PES Colloquium scan resolution low; flagged for human review</div>
              <div className="text-blue-400">[10:12:07] Staged in local memory ledger (45.4 MB)</div>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowLogModal(false)}
                className="h-9 px-4 bg-primary text-on-primary rounded-lg font-semibold text-label-sm"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-semibold text-headline-sm text-on-surface">Institutional Migration Guide</h3>
              <button onClick={() => setShowGuideModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="text-body-sm text-on-surface-variant space-y-2.5">
              <p>Follow these steps to batch-migrate historical department files:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                <li>Zip files organized by Academic Year (e.g. AY2022-23_Events.zip).</li>
                <li>Ensure sanction approval letters or circular PDFs are inside.</li>
                <li>The system will extract dates, faculty names, and NAAC criteria automatically.</li>
                <li>Review any records flagged in amber before committing.</li>
              </ol>
            </div>
            <div className="pt-2 text-right">
              <button
                onClick={() => setShowGuideModal(false)}
                className="h-9 px-4 bg-primary text-on-primary rounded-lg font-semibold text-label-sm"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
