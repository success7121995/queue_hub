"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export interface CompleteProps {
  onSubmit?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const Complete = ({ onSubmit }: CompleteProps) => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // 倒數計時
  useEffect(() => {
    if (countdown <= 0) {
      router.push("/"); // 倒數完跳首頁
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  // 按鈕handler，點擊即刻跳轉首頁
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onSubmit) onSubmit(e);
    router.push("/");
  };

  return (
    <>
      {/* Completion Step */}
      <div className="text-center space-y-4 w-[80%] mx-auto lg:w-full">
        <div className="text-2xl font-semibold text-yellow-600">Registration Under Review</div>
        <div className="text-gray-600">
          Thank you for signing up! Your registration is under review. We will notify you once your account is approved and ready to use.
        </div>
        <div className="pt-4">
          <button
            type="button"
            onClick={handleClick}
            className="bg-primary text-white py-2 px-6 rounded font-semibold w-full sm:w-[200px] cursor-pointer"
          >
            Go to Home ({countdown})
          </button>
        </div>
      </div>
    </>
  );
};

export default Complete;