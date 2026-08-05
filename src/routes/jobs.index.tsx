import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  categories,
  employmentTypes,
  jobs,
  locations,
} from "@/data/marketplace";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Browse Jobs in Ethiopia — EthioJobs Connect" },
      {
        name: "description",
        content:
          "Search and filter jobs across Ethiopia by keyword, category, city, employment type and remote work on EthioJobs Connect.",
      },
      { property: "og:title", content: "Browse Jobs in Ethiopia — EthioJobs Connect" },
      {
        property: "og:description",
        content:
          "Search and filter jobs across Ethiopia by keyword, category, city, employment type and remote work.",
      },
    ],
  }),
  component: BrowseJobs,
});

const ANY = "any";

function BrowseJobs() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState(ANY);
  const [location, setLocation] = useState(ANY);
  const [type, setType] = useState(ANY);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [sort, setSort] = useState("latest");

  const results = useMemo(() => {
    const filtered = jobs.filter((job) => {
      const k = keyword.trim().toLowerCase();
      const matchesKeyword =
        !k ||
        job.title.toLowerCase().includes(k) ||
        job.skills.some((s) => s.toLowerCase().includes(k)) ||
        job.description.toLowerCase().includes(k);
      return (
        matchesKeyword &&
        (category === ANY || job.category === category) &&
        (location === ANY || job.location === location) &&
        (type === ANY || job.employmentType === type) &&
        (!remoteOnly || job.remote)
      );
    });

    return [...filtered].sort((a, b) => {
      if (sort === "salary") return b.salaryMax - a.salaryMax;
      if (sort === "deadline") return a.deadline.localeCompare(b.deadline);
      if (sort === "popular") return b.applicants - a.applicants;
      return b.postedAt.localeCompare(a.postedAt);
    });
  }, [keyword, category, location, type, remoteOnly, sort]);

  const reset = () => {
    setKeyword("");
    setCategory(ANY);
    setLocation(ANY);
    setType(ANY);
    setRemoteOnly(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      <h1 className="rule-gold font-display text-3xl font-bold">Browse jobs</h1>
      <p className="mt-4 text-muted-foreground">
        {results.length} role{results.length === 1 ? "" : "s"} matching your filters.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr] lg:items-start">
        <aside className="rounded-lg border border-border/70 bg-card p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-24">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="keyword">Keyword</Label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Title, skill…"
                  className="pl-9"
                />
              </div>
            </div>

            <FilterSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={categories.map((c) => c.name)}
              anyLabel="All categories"
            />
            <FilterSelect
              label="Location"
              value={location}
              onChange={setLocation}
              options={locations}
              anyLabel="All locations"
            />
            <FilterSelect
              label="Employment type"
              value={type}
              onChange={setType}
              options={[...employmentTypes]}
              anyLabel="Any type"
            />

            <div className="flex items-center justify-between">
              <Label htmlFor="remote">Remote only</Label>
              <Switch id="remote" checked={remoteOnly} onCheckedChange={setRemoteOnly} />
            </div>

            <Button variant="outline" className="w-full" onClick={reset}>
              Reset filters
            </Button>
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-end gap-3">
            <Label htmlFor="sort" className="text-muted-foreground">
              Sort by
            </Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger id="sort" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="salary">Highest salary</SelectItem>
                <SelectItem value="deadline">Closing soon</SelectItem>
                <SelectItem value="popular">Most popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 grid gap-4">
            {results.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
            {results.length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-12 text-center">
                <p className="font-display font-semibold">No jobs match those filters</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try a broader keyword or clear a filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  anyLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  anyLabel: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>{anyLabel}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
