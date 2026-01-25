declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '@mantine/core/styles.css' {
  export const styles: Record<string, string>;
}
