import * as sass from 'sass';

type SassFunction = (args: sass.Value[]) => sass.Value;

export const modernSassFunctions: Record<string, SassFunction> = {
  'theme-color($name, $opacity: 1)': (args: sass.Value[]): sass.Value => {
    const name = (args[0] as sass.SassString).toString();
    const opacity = args[1] ? Number((args[1] as sass.SassNumber).toString()) : 1;

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

    return new sass.SassColor({ red: r, green: g, blue: b, alpha: opacity });
  },

  'px-to-rem($px)': (args: sass.Value[]): sass.Value => {
    const px = Number((args[0] as sass.SassNumber).toString());
    const rem = px / 16;

    // Assuming 16px base font size
    return new sass.SassNumber(rem, { numeratorUnits: ['rem'] });
  },

  'safe-area($property, $value)': (args: sass.Value[]): sass.Value => {
    const property = (args[0] as sass.SassString).toString();
    const value = (args[1] as sass.SassString).toString();

    return new sass.SassString(
      `
      ${property}: ${value};
      ${property}: env(safe-area-inset-${value});
    `.trim(),
    );
  },
};
