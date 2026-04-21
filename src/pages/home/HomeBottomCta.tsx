import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface HomeBottomCtaProps {
  onBecomeMaster: () => void;
  onFindMaster: () => void;
}

export default function HomeBottomCta({ onBecomeMaster, onFindMaster }: HomeBottomCtaProps) {
  return (
    <section className="py-16 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
          Готов предложить свои услуги?
        </h2>
        <p className="text-gray-400 mb-8">
          Размещай объявления, откликайся на заявки и находи клиентов в своём городе
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onBecomeMaster} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-8 py-3 text-base rounded-xl">
            Стать мастером
            <Icon name="ArrowRight" size={18} className="ml-2" />
          </Button>
          <Button onClick={onFindMaster} variant="ghost" className="border border-violet-500 text-violet-300 hover:text-violet-200 hover:bg-violet-600/15 px-8 py-3 text-base rounded-xl">
            Найти мастера
          </Button>
        </div>
      </div>
    </section>
  );
}
