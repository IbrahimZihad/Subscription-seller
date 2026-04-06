// components/CategoryTabs.tsx
interface Props {
  current: string;
  setFilter: (cat: string) => void;
}

const CATEGORIES = ["all", "ai", "stream", "tools"];

export default function CategoryTabs({ current, setFilter }: Props) {
  return (
    <div className="flex gap-3 mb-6">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setFilter(cat)}
          className={`px-4 py-2 rounded ${
            current === cat ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {cat.toUpperCase()}
        </button>
      ))}
    </div>
  );
}