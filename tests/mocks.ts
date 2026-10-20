import { jest } from "bun:test";
import type * as React from "react";

export function changeEvent(target: {
  value: string;
  valueAsNumber?: number;
  valid?: boolean;
}): React.ChangeEvent<HTMLInputElement> {
  return {
    currentTarget: {
      value: target.value,
      valueAsNumber: target.valueAsNumber ?? Number.NaN,
      validity: { valid: target.valid ?? true },
    },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

export function fileChangeEvent(files: ReadonlyArray<File>): React.ChangeEvent<HTMLInputElement> {
  return { currentTarget: { files } } as unknown as React.ChangeEvent<HTMLInputElement>;
}

export function mouseEvent(): React.MouseEvent {
  return { preventDefault: jest.fn() } as unknown as React.MouseEvent;
}

export function animationEvent(animationName: string): React.AnimationEvent {
  return { animationName } as unknown as React.AnimationEvent;
}
