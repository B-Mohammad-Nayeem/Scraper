import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar.js';
import { SearchHeader } from './components/SearchHeader.js';
import { StatsBar } from './components/StatsBar.js';
import { FilterBar, ViewLayout } from './components/FilterBar.js';
import { OrganizationCard } from './components/OrganizationCard.js';
import { TableView } from './components/TableView.js';
import { MapView } from './components/MapView.js';
import { OrganizationDetailModal } from './components/OrganizationDetailModal.js';
import { WeightSettingsModal, DEFAULT_CONFIG } from './components/WeightSettingsModal.js';
import { DocsModal } from './components/DocsModal.js';
import { Pagination } from './components/Pagination.js';
import {
  OrganizationItem,
  OrganizationTypeFilter,
  SearchJobStatus,
  SearchResponse,
  VerificationStatus,
  VerificationWeightConfig
} from './types.js';

export default function App() {
  // Search parameters
  const [location, setLocation] = useState('Madhapur, Hyderabad');
  const [orgType, setOrgType] = useState<OrganizationTypeFilter>('all');
  const [radiusKm, setRadiusKm] = useState(5);
  const [keyword, setKeyword] = useState('');

  // UI view states
  const [layout, setLayout] = useState<ViewLayout>('split');
  const [sortBy, setSortBy] = useState<'distance' | 'score' | 'name'>('score');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [filterHasWebsite, setFilterHasWebsite] = useState(false);
  const [filterHasPhone, setFilterHasPhone] = useState(false);
  const [filterHasEmail, setFilterHasEmail] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // Modals
  const [selectedItem, setSelectedItem] = useState<OrganizationItem | null>(null);
  const [modalItem, setModalItem] = useState<OrganizationItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [docsOpen, setDocsOpen] = useState(false);
  const [weights, setWeights] = useState<VerificationWeightConfig>(DEFAULT_CONFIG);

  // Execution states
  const [isSearching, setIsSearching] = useState(false);
  const [jobStatus, setJobStatus] = useState<SearchJobStatus | null>(null);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);

  // Core Search Execution
  const executeSearch = useCallback(async (targetLocation?: string) => {
    const loc = targetLocation || location;
    if (!loc.trim()) return;

    setIsSearching(true);
    setJobStatus({
      job_id: 'init',
      status: 'QUEUED',
      progress: 15,
      message: `Initializing discovery engine for '${loc}'...`
    });

    try {
      // 1. Create async job
      const res = await fetch('/api/v1/search?async=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: loc,
          organization_type: orgType,
          keyword: keyword.trim() || undefined,
          radius_km: radiusKm,
          page: 1,
          page_size: 100
        })
      });

      if (!res.ok) {
        throw new Error(`Search request failed with HTTP ${res.status}`);
      }

      const { job_id } = await res.json();

      // 2. Poll job until completion
      let completed = false;
      let attempts = 0;

      while (!completed && attempts < 30) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        attempts++;

        const pollRes = await fetch(`/api/v1/search/${job_id}`);
        if (!pollRes.ok) continue;

        const pollData = await pollRes.json();
        setJobStatus(pollData);

        if (pollData.status === 'COMPLETED') {
          completed = true;
          if (pollData.data) {
            setSearchResponse(pollData.data);
            setPage(1);
            if (pollData.data.results.length > 0) {
              setSelectedItem(pollData.data.results[0]);
            }
          }
          break;
        } else if (pollData.status === 'FAILED') {
          throw new Error(pollData.error || 'Discovery job execution failed');
        }
      }
    } catch (err: any) {
      console.warn('Async search failed, attempting fallback direct execution:', err);
      // Fallback: direct sync call
      try {
        const directRes = await fetch('/api/v1/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: loc,
            organization_type: orgType,
            keyword: keyword.trim() || undefined,
            radius_km: radiusKm,
            page: 1,
            page_size: 100
          })
        });
        if (directRes.ok) {
          const directData = await directRes.json();
          setSearchResponse(directData);
          setPage(1);
          if (directData.results.length > 0) {
            setSelectedItem(directData.results[0]);
          }
        }
      } catch (fallbackErr) {
        console.error('All search attempts failed:', fallbackErr);
      }
    } finally {
      setIsSearching(false);
      setTimeout(() => setJobStatus(null), 1200);
    }
  }, [location, orgType, radiusKm, keyword]);

  // Initial load on first render
  useEffect(() => {
    executeSearch('Madhapur, Hyderabad');
  }, []);

  // Filter & Sort results on client side
  const filteredAndSortedItems = useMemo(() => {
    if (!searchResponse) return [];

    let items = [...searchResponse.results];

    // Status filter
    if (activeStatusFilter !== 'all') {
      items = items.filter((it) => it.verification_status === activeStatusFilter);
    }

    // Has Phone
    if (filterHasPhone) {
      items = items.filter(
        (it) => it.normalized_phone && it.normalized_phone !== 'Not available'
      );
    }

    // Has Website
    if (filterHasWebsite) {
      items = items.filter(
        (it) => it.website && it.website !== 'Not available' && it.website.startsWith('http')
      );
    }

    // Has Email
    if (filterHasEmail) {
      items = items.filter(
        (it) => it.email && it.email !== 'Not available'
      );
    }

    // Sorting
    items.sort((a, b) => {
      if (sortBy === 'distance') return a.distance_km - b.distance_km;
      if (sortBy === 'score') return b.verification_score - a.verification_score;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

    return items;
  }, [
    searchResponse,
    activeStatusFilter,
    filterHasPhone,
    filterHasWebsite,
    filterHasEmail,
    sortBy
  ]);

  // Paginated slice
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredAndSortedItems.slice(start, start + pageSize);
  }, [filteredAndSortedItems, page, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / pageSize));

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenDocs={() => setDocsOpen(true)}
      />

      {/* 2. Search Controls */}
      <SearchHeader
        location={location}
        setLocation={setLocation}
        orgType={orgType}
        setOrgType={setOrgType}
        radiusKm={radiusKm}
        setRadiusKm={setRadiusKm}
        keyword={keyword}
        setKeyword={setKeyword}
        onSearch={() => executeSearch()}
        isSearching={isSearching}
        jobStatus={jobStatus}
      />

      {/* 3. Summary Stats Bar */}
      <StatsBar
        location={searchResponse?.search_location || null}
        total={searchResponse?.total || 0}
        companiesCount={searchResponse?.companies_count || 0}
        hospitalsCount={searchResponse?.hospitals_count || 0}
        verifiedCount={searchResponse?.verified || 0}
        likelyVerifiedCount={searchResponse?.likely_verified || 0}
        unverifiedCount={searchResponse?.unverified || 0}
        activeStatusFilter={activeStatusFilter}
        onSelectStatusFilter={setActiveStatusFilter}
      />

      {/* 4. Action Filter & Layout Bar */}
      <FilterBar
        layout={layout}
        setLayout={setLayout}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filterHasWebsite={filterHasWebsite}
        setFilterHasWebsite={setFilterHasWebsite}
        filterHasPhone={filterHasPhone}
        setFilterHasPhone={setFilterHasPhone}
        filterHasEmail={filterHasEmail}
        setFilterHasEmail={setFilterHasEmail}
        items={filteredAndSortedItems}
        totalFiltered={filteredAndSortedItems.length}
      />

      {/* 5. Main Content Dashboard Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* Split View: Map + Cards List */}
        {layout === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Sticky Map */}
            <div className="lg:col-span-6 lg:sticky lg:top-20 h-[520px] lg:h-[calc(100vh-140px)]">
              <MapView
                location={searchResponse?.search_location || null}
                radiusKm={radiusKm}
                items={filteredAndSortedItems}
                selectedItem={selectedItem}
                onSelectItem={(item) => setSelectedItem(item)}
              />
            </div>

            {/* Right: Organization Cards List */}
            <div className="lg:col-span-6 space-y-3.5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>
                  Showing <strong className="text-slate-800">{paginatedItems.length}</strong> of{' '}
                  <strong className="text-slate-800">{filteredAndSortedItems.length}</strong> matched organizations
                </span>
                {activeStatusFilter !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveStatusFilter('all')}
                    className="text-blue-600 hover:underline"
                  >
                    Clear status filter
                  </button>
                )}
              </div>

              {paginatedItems.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
                  No verified organizations found matching your active filters. Try clearing some filters.
                </div>
              ) : (
                paginatedItems.map((item) => (
                  <OrganizationCard
                    key={item.id}
                    item={item}
                    isSelected={selectedItem?.id === item.id}
                    onSelect={() => setSelectedItem(item)}
                    onViewDetails={() => setModalItem(item)}
                  />
                ))
              )}

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredAndSortedItems.length}
                onPageChange={(p) => setPage(p)}
                onPageSizeChange={(s) => {
                  setPageSize(s);
                  setPage(1);
                }}
              />
            </div>
          </div>
        )}

        {/* Cards Only View */}
        {layout === 'cards' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedItems.map((item) => (
                <OrganizationCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItem(item)}
                  onViewDetails={() => setModalItem(item)}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredAndSortedItems.length}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </div>
        )}

        {/* Dense Table View */}
        {layout === 'table' && (
          <div className="space-y-4">
            <TableView
              items={paginatedItems}
              selectedItem={selectedItem}
              onSelectItem={(item) => setSelectedItem(item)}
              onViewDetails={(item) => setModalItem(item)}
            />

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filteredAndSortedItems.length}
              onPageChange={(p) => setPage(p)}
              onPageSizeChange={(s) => {
                setPageSize(s);
                setPage(1);
              }}
            />
          </div>
        )}

        {/* Map Only View */}
        {layout === 'map' && (
          <div className="h-[calc(100vh-220px)] min-h-[500px]">
            <MapView
              location={searchResponse?.search_location || null}
              radiusKm={radiusKm}
              items={filteredAndSortedItems}
              selectedItem={selectedItem}
              onSelectItem={(item) => {
                setSelectedItem(item);
                setModalItem(item);
              }}
            />
          </div>
        )}
      </main>

      {/* 6. Modals */}
      <OrganizationDetailModal
        item={modalItem}
        onClose={() => setModalItem(null)}
      />

      {settingsOpen && (
        <WeightSettingsModal
          weights={weights}
          onSaveWeights={(newWeights) => setWeights(newWeights)}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {docsOpen && <DocsModal onClose={() => setDocsOpen(false)} />}
    </div>
  );
}
