"use client";

import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

type ModalProps = {
  className?: string;
  classWrap?: string;
  classOverlay?: string;
  classButtonClose?: string;
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
};

const Modal = ({
  className,
  classWrap,
  classOverlay,
  classButtonClose,
  visible,
  onClose,
  children,
  title,
}: ModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      className={twMerge(
        `fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`
      )}
    >
      <div
        className={twMerge(
          `fixed inset-0 bg-n-7/90 dark:bg-n-8/90 opacity-100 transition-opacity ${classOverlay}`
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={twMerge(
          `relative z-10 w-full max-w-sm bg-n-1 dark:bg-n-7 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${classWrap}`
        )}
      >
        <div className="flex justify-between items-center p-4 border-b border-n-3 dark:border-n-6">
            <h3 className="h6">{title || ""}</h3>
            <button
            className={twMerge(
                `w-8 h-8 flex items-center justify-center rounded-full hover:bg-n-2 dark:hover:bg-n-6 transition-colors text-n-4 hover:text-n-7 dark:text-n-3 dark:hover:text-n-1 ${classButtonClose}`
            )}
            onClick={onClose}
            >
            <Icon name="close" className="w-5 h-5 fill-current" />
            </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
