import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface ServiceDeleteModalProps {
  deleteServiceId: number | null;
  deleteServiceLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ServiceDeleteModal({
  deleteServiceId,
  deleteServiceLoading,
  onConfirm,
  onCancel,
}: ServiceDeleteModalProps) {
  if (!deleteServiceId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1d27] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
        <div className="w-14 h-14 rounded-full bg-red-600/15 flex items-center justify-center mx-auto mb-4">
          <Icon name="Trash2" size={24} className="text-red-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">Удалить услугу?</h3>
        <p className="text-gray-400 text-sm mb-6">Услуга будет удалена с сайта навсегда.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1 text-gray-400" onClick={onCancel}>Отмена</Button>
          <Button disabled={deleteServiceLoading} onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-500 text-white">
            {deleteServiceLoading ? "Удаление..." : "Удалить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
