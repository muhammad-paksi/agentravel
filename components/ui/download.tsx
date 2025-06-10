// components/ui/DownloadButton.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils'; // Asumsi Anda menggunakan shadcn/ui atau setup serupa

const buttonVariants = cva(
'group relative inline-flex items-center justify-center rounded-full shadow-lg transform transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500',
    {
        variants: {
            size: {
            default: 'w-[50px] h-[50px]',
            sm: 'w-[40px] h-[40px]',
            lg: 'w-[60px] h-[60px]',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    }
);

const iconVariants = cva(
'transition ease-out duration-300',
    {
        variants: {
            isLoading: {
                true: 'hidden',
                false: 'block rotate-0 scale-100 group-hover:-rotate-45 group-hover:scale-75 group-disabled:rotate-0 group-disabled:scale-100'
            },
            size: {
                default: 'w-[30px] h-[30px]',
                sm: 'w-[24px] h-[24px]',
                lg: 'w-[36px] h-[36px]',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    }
)

export interface DownloadButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    isLoading?: boolean;
}

const DownloadButton = React.forwardRef<HTMLButtonElement, DownloadButtonProps>(
    ({ className, size, isLoading = false, disabled, ...props }, ref) => {
        const isDisabled = isLoading || disabled;

        return (
        <button
            ref={ref}
            disabled={isDisabled}
            className={cn(
            // Terapkan gradient hanya saat tidak disabled
            !isDisabled && 'bg-gradient-to-r from-blue-500 to-green-500', 
            buttonVariants({ size, className })
            )}
            {...props}
        >
            {/* Ikon Spinner (tampil saat isLoading true) */}
            {isLoading && (
            <svg
                className={cn("animate-spin", iconVariants({ size }))}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                ></circle>
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
            </svg>
            )}

            {/* Ikon Download (tampil saat tidak loading) */}
            <svg
            className={cn(iconVariants({ isLoading, size }))}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            <g id="SVGRepo_iconCarrier">
                <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z"
                fill="#FFFFFF"
                ></path>
            </g>
            </svg>
        </button>
        );
    }
);

DownloadButton.displayName = 'DownloadButton';

export { DownloadButton };
