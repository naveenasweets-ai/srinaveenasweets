import { useIsFetching } from '@tanstack/react-query';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function GlobalSpinner() {
  const isFetching = useIsFetching();
  if (!isFetching) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pink-100/40 backdrop-blur-sm">
      <DotLottieReact
        src="https://lottie.host/9ab9c940-eef4-4b34-a23e-b2a760744645/PmVg9dOemF.lottie"
        loop
        autoplay
        className="w-24 h-24"
      />
    </div>
  );
}
