import Icon from "@/components/ui/icon";

export default function MasterPageHeader() {
  return (
    <div className="border-b border-white/8 bg-[#0a0d16]/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-gray-400 hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <a href="/" className="flex items-center gap-2">
          <img src="https://cdn.poehali.dev/projects/b7f56b72-3dfb-49ff-a0ce-cff7b631f477/files/bb517738-7e1e-4e29-bd74-607574a9b222.jpg" alt="HandyMan" className="w-7 h-7 rounded-lg object-cover" />
          <span className="font-bold text-sm bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">HandyMan</span>
        </a>
      </div>
    </div>
  );
}
