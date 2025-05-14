
import { ArrowRight } from "lucide-react";

const SwapArrow = () => {
  return (
    <div className="flex items-center justify-center w-12 h-12">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center backdrop-blur-sm">
        <ArrowRight className="text-primary w-5 h-5" />
      </div>
    </div>
  );
};

export default SwapArrow;
