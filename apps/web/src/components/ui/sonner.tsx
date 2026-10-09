'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import type * as React from 'react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="light"
    position="bottom-center"
    className="toaster group"
    icons={{
      success: <CircleCheckIcon className="size-4 text-tennis" />,
      info: <InfoIcon className="size-4" />,
      warning: <TriangleAlertIcon className="size-4" />,
      error: <OctagonXIcon className="size-4 text-[#ffa3a3]" />,
      loading: <Loader2Icon className="size-4 animate-spin" />,
    }}
    style={
      {
        '--normal-bg': 'var(--ink)',
        '--normal-text': '#ffffff',
        '--normal-border': 'var(--ink)',
        '--border-radius': '999px',
      } as React.CSSProperties
    }
    {...props}
  />
);

export { Toaster };
