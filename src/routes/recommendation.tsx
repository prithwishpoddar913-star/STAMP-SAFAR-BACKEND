import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { stamps, useStampAvailability, type Stamp } from "@/lib/stamps";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Sparkles, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/recommendation")({
  component: RecommendationPage,
});

function calcPostage(weight: number): number {
  if (!weight || weight <= 0) return 0;
  if (weight <= 20) return 5;
  return 5 + Math.ceil((weight - 20) / 5) * 5;
}

function RecommendationPage() {
  const [from, setFrom] = useState("Kolkata");
  const [to, setTo] = useState("Delhi");
  const [pages, setPages] = useState<number>(4);

  const weight = useMemo(() => pages * 5, [pages]);
  const postage = useMemo(() => calcPostage(weight), [weight]);

  const recommendations = useMemo(() => {
    let pool = stamps;

    const cityMatch = pool.filter(
      (s) =>
        s.city?.toLowerCase().includes(to.toLowerCase()) ||
        s.state?.toLowerCase().includes(to.toLowerCase())
    );

    if (cityMatch.length > 0) pool = cityMatch;

    return [...pool]
      .sort(
        (a, b) =>
          Math.abs(a.price - postage) -
          Math.abs(b.price - postage)
      )
      .slice(0, 6);
  }, [to, postage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <SiteLayout>
      {/* ================= BACKGROUND VIDEO ================= */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="/Recommendation%20video%20bg%201.mp4"
            type="video/mp4"
          />
        </video>

        {/* dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="min-h-screen text-foreground relative z-10">
        {/* HEADER */}
        <div className="text-center pt-10 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            AI Stamp Recommendation Engine
          </div>

          <h1 className="mt-4 text-4xl font-bold">
            Smart Postal Assistant
          </h1>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto mt-8 p-6 border rounded-2xl bg-card space-y-5 shadow-lg backdrop-blur-md bg-card/90"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                From City
              </label>
              <Input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                placeholder="Origin City"
                className="bg-background/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                To City
              </label>
              <Input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Destination City"
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Enter Number of Pages
              </label>
              <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full">
                5g per page
              </span>
            </div>
            <Input
              type="number"
              min={1}
              value={pages === 0 ? "" : pages}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                setPages(val);
              }}
              placeholder="e.g. 4"
              className="bg-background/50 h-11 text-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex flex-col justify-center p-3 bg-muted/60 rounded-xl border border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Estimated Weight</span>
              <span className="text-lg font-bold text-foreground mt-0.5">
                {weight}g
              </span>
            </div>
            <div className="flex flex-col justify-center p-3 bg-muted/60 rounded-xl border border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Postage</span>
              <span className="text-lg font-bold flex items-center gap-1 text-foreground mt-0.5">
                <IndianRupee className="w-4 h-4" />
                {postage}
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold transition-all hover:scale-[1.01]">
            Get AI Recommendation
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2 leading-relaxed px-2">
            Note: Weight is estimated assuming each page weighs approximately 5 grams. Actual postal charges may vary depending on paper type and envelope weight.
          </p>
        </form>

        {/* RESULTS */}
        {pages > 0 && (
          <div className="max-w-5xl mx-auto mt-10 px-4 pb-20">
            <h2 className="text-xl font-semibold mb-4">
              Recommended Stamps
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.map((s) => (
                <RecommendedStampCard key={s.id} s={s} />
              ))}
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function RecommendedStampCard({ s }: { s: Stamp }) {
  const available = useStampAvailability(s.id);

  return (
    <div
      className={`border rounded-xl p-3 bg-card flex flex-col justify-between ${
        !available ? "opacity-80" : ""
      }`}
    >
      <div>
        <div className="relative h-32 w-full">
          <img
            src={s.image}
            className={`h-full w-full object-contain transition ${
              !available ? "grayscale" : ""
            }`}
          />
          {!available && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg">
              <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                SOLD OUT
              </span>
            </div>
          )}
        </div>

        <div className="mt-2 font-semibold truncate">
          {s.name}
        </div>

        <div className="text-xs text-muted-foreground flex gap-1 items-center">
          <MapPin className="w-3.5 h-3.5" />
          {s.city}, {s.state}
        </div>

        <div className="flex justify-between items-center mt-2">
          <span className="font-bold">
            ₹{s.price}
          </span>
          <span
            className={`text-xs ${
              available ? "text-emerald-600" : "text-red-500 font-medium"
            }`}
          >
            {available ? "● Available" : "● Sold Out"}
          </span>
          <Badge>{s.rarity}</Badge>
        </div>
      </div>

      {available ? (
        <Link
          to="/stamps/$stampId"
          params={{ stampId: s.id }}
        >
          <Button className="w-full mt-3" size="sm">
            View Stamp{" "}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      ) : (
        <Button
          disabled
          className="w-full mt-3 bg-muted text-muted-foreground cursor-not-allowed"
          size="sm"
        >
          Sold Out
        </Button>
      )}
    </div>
  );
}