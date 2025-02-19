import { Value, SassNumber, SassColor, SassString } from 'sass';

export const modernSassFunctions = {
  'theme-color($name, $opacity: 1)': (args: Value[]) => {
    const name = (args[0] as SassString).text;
    const opacity = args[1] ? (args[1] as SassNumber).value : 1;

    // Example of how to handle theme colors with modern Sass
    const themeColors: Record<string, string> = {
      primary: '#9e75f0',
      secondary: '#8a2be2',
      accent: '#803bef',
    };

    const color = themeColors[name] || '#000000';

    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;

    return new SassColor({ x: r, y: g, z: b, alpha: opacity, space: 'xyz' });
  },

  'px-to-rem($px)': (args: Value[]) => {
    const px = (args[0] as SassNumber).value;
    const rem = px / 16;

    // Assuming 16px base font size
    return new SassNumber(rem, 'rem');
  },

  'safe-area($property, $value)': (args: Value[]) => {
    const property = (args[0] as SassString).text;
    const value = (args[1] as SassString).text;

    return new SassString(
      `
      ${property}: ${value};
      ${property}: env(safe-area-inset-${value});
    `.trim(),
    );
  },
};
