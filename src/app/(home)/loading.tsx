import { HomePageLoadingSkeleton } from "@/components/home/home-skeletons";

export default function HomeLoading() {
  return (
    <div aria-busy="true" data-route-loading-shell role="status">
      <span className="sr-only">Loading the A1 Haat Bazar homepage…</span>
      <div className="route-loading-bar" />
      <HomePageLoadingSkeleton />
    </div>
  );
}
