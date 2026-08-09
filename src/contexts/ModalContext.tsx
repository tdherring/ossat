import {
  createContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type ModalState = ReactNode;
type ModalContextValue = [ModalState, Dispatch<SetStateAction<ModalState>>];

export const ModalContext = createContext<ModalContextValue>(null!);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<ModalState>(null);

  useEffect(() => {
    if (!activeModal) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveModal(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeModal]);

  return (
    <ModalContext.Provider value={[activeModal, setActiveModal]}>{children}</ModalContext.Provider>
  );
};
