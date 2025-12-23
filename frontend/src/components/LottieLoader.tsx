import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface LottieLoaderProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
  text?: string;
}

const LottieLoader = ({ size = 'medium', className = '', text }: LottieLoaderProps) => {
  // Responsive size mapping
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-16 h-16 sm:w-20 sm:h-20'; // 64px mobile, 80px desktop
      case 'medium':
        return 'w-24 h-24 sm:w-32 sm:h-32'; // 96px mobile, 128px desktop
      case 'large':
        return 'w-32 h-32 sm:w-48 sm:h-48'; // 128px mobile, 192px desktop
      case 'xlarge':
        return 'w-40 h-40 sm:w-56 sm:h-56'; // 160px mobile, 224px desktop
      default:
        return 'w-24 h-24 sm:w-32 sm:h-32';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={getSizeClasses()}>
        <DotLottieReact
          src="https://lottie.host/050bd81e-dd48-4239-a33f-b9eb82e7b292/2MVYzUCM0D.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {text && (
        <p className="text-white text-sm sm:text-lg mt-4">{text}</p>
      )}
    </div>
  );
};

export default LottieLoader;
