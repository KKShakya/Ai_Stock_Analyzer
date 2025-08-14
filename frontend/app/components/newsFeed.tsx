// app/dashboard/components/NewsFeed.tsx
export default function NewsFeed() {
  return (
    <div className="bg-white dark:bg-popover text-foreground rounded-2xl shadow-md p-6 transition hover:shadow-lg">
      <h3 className="text-lg font-medium mb-4">News Feed</h3>
      <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <li>• Tesla hits new production record</li>
        <li>• Market pulse: Tech leads gains</li>
        <li>• OI spike at strike 17300</li>
      </ul>
    </div>
  );
}
