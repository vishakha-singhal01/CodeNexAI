import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			prose: {
				dark: {
					css: {
						body: 'hsl(var(--foreground))',
						h1: 'hsl(var(--primary))',
						h2: 'hsl(var(--primary))',
						h3: 'hsl(var(--primary))',
						h4: 'hsl(var(--primary))',
						h5: 'hsl(var(--primary))',
						h6: 'hsl(var(--primary))',
						ul: {
							color: 'hsl(var(--foreground))',
						},
						ol: {
							color: 'hsl(var(--foreground))',
						},
						li: {
							color: 'hsl(var(--foreground))',
						},
						code: {
							color: 'hsl(var(--foreground))',
							backgroundColor: 'hsl(var(--muted))',
						},
						blockquote: {
							color: 'hsl(var(--foreground))',
							borderLeftColor: 'hsl(var(--border))',
						},
						select: {
							backgroundColor: 'hsl(var(--background))',
							color: 'hsl(var(--foreground))',
							borderColor: 'hsl(var(--border))',
						},
					}
				}
			},
			dark: {
				select: {
					backgroundColor: 'hsl(var(--background))',
					color: 'hsl(var(--foreground))',
					borderColor: 'hsl(var(--border))',
				},
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
