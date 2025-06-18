import { useStats } from "@/hooks/use-experiments";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatsSection() {
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-r border-gray-200 last:border-r-0">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="border-r border-gray-200 last:border-r-0">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.experiments}</div>
            <div className="text-gray-600">Available Experiments</div>
          </div>
          <div className="border-r border-gray-200 last:border-r-0">
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.students.toLocaleString()}</div>
            <div className="text-gray-600">Active Students</div>
          </div>
          <div className="border-r border-gray-200 last:border-r-0">
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.completed.toLocaleString()}</div>
            <div className="text-gray-600">Experiments Completed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.rating}</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
}
