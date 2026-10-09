'use client';

import { useState } from 'react';
import { NativeSelect } from '@/components/native-select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BUNDLED_IMAGES } from '@/lib/bundled-images';

const NONE = '';
const CUSTOM = '__custom__';

/**
 * Pick a bundled photo or enter any image URL. The chosen value is sent in
 * a hidden `imageUrl` field, so the form works like a single input.
 */
export function ImagePicker({
  idPrefix,
  defaultValue,
  error,
}: {
  idPrefix: string;
  defaultValue: string;
  error?: string;
}) {
  const choiceId = `${idPrefix}-image-choice`;
  const urlId = `${idPrefix}-image-url`;
  const errorId = `${idPrefix}-imageUrl-error`;
  const isBundled = BUNDLED_IMAGES.some((image) => image.path === defaultValue);
  const [choice, setChoice] = useState(
    defaultValue === '' ? NONE : isBundled ? defaultValue : CUSTOM,
  );
  const [customUrl, setCustomUrl] = useState(isBundled ? '' : defaultValue);
  const value = choice === CUSTOM ? customUrl.trim() : choice;

  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_8rem] sm:items-start">
      <div className="grid gap-3">
        <div>
          <Label htmlFor={choiceId}>Fotka</Label>
          <NativeSelect
            id={choiceId}
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
            aria-invalid={Boolean(error) && choice !== CUSTOM}
            aria-describedby={error ? errorId : undefined}
            className="mt-1.5"
          >
            <option value={NONE}>Bez fotky</option>
            {BUNDLED_IMAGES.map((image) => (
              <option key={image.path} value={image.path}>
                {image.label}
              </option>
            ))}
            <option value={CUSTOM}>Vlastná adresa obrázka (URL)…</option>
          </NativeSelect>
        </div>
        {choice === CUSTOM ? (
          <div>
            <Label htmlFor={urlId}>Adresa obrázka</Label>
            <Input
              id={urlId}
              type="url"
              inputMode="url"
              placeholder="https://…"
              value={customUrl}
              onChange={(event) => setCustomUrl(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="mt-1.5"
            />
          </div>
        ) : null}
        {error ? (
          <p id={errorId} className="font-semibold text-destructive">
            {error}
          </p>
        ) : null}
        <input type="hidden" name="imageUrl" value={value} />
      </div>

      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview of any URL the admin types
        <img
          src={value}
          alt="Náhľad vybranej fotky"
          className="aspect-[4/5] w-32 rounded-2xl bg-mist object-cover"
        />
      ) : (
        <div className="flex aspect-[4/5] w-32 items-center justify-center rounded-2xl bg-mist text-center text-sm text-muted-foreground">
          Bez fotky
        </div>
      )}
    </div>
  );
}
