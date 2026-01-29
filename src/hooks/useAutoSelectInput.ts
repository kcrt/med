import { useEffect, useRef } from "react";

/**
 * Custom hook for automatically selecting input content when a condition is met.
 * 
 * Commonly used to auto-select text in inputs when modals open, making it
 * easy for users to copy the content immediately.
 * 
 * @param isActive - Boolean indicating when to trigger the auto-select
 * @param delay - Delay in milliseconds before selecting (default: 50ms)
 * @returns Ref to attach to the input element
 * 
 * @example
 * ```tsx
 * const [opened, setOpened] = useState(false);
 * const inputRef = useAutoSelectInput(opened);
 * 
 * return (
 *   <Modal opened={opened}>
 *     <TextInput ref={inputRef} value={url} readOnly />
 *   </Modal>
 * );
 * ```
 */
export function useAutoSelectInput<T extends HTMLInputElement>(
  isActive: boolean,
  delay = 50
) {
  const inputRef = useRef<T>(null);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        inputRef.current?.select();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isActive, delay]);

  return inputRef;
}
