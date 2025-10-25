import { useMemo, useState } from "react";

type UseFileNameType = string;

export type UseFileConfigType = { maxSizeBytes?: number };

export enum UseFileState {
  idle = "idle",
  selected = "selected",
  error = "error",
}

type UseFileLabelType = { props: { htmlFor: UseFileNameType } };
type UseFileInputType = {
  props: { id: UseFileNameType; name: UseFileNameType; multiple: false };
  key: React.Key;
};
type UseFileActionsType = {
  selectFile(event: React.ChangeEvent<HTMLInputElement>): File | undefined;
  clearFile: VoidFunction;
};

type UseFileIdle = {
  actions: UseFileActionsType;
  data: null;
  input: UseFileInputType;
  isError: false;
  isIdle: true;
  isSelected: false;
  label: UseFileLabelType;
  matches: (states: UseFileState[]) => boolean;
  state: UseFileState.idle;
};

type UseFileSelected = {
  actions: UseFileActionsType;
  data: File;
  input: UseFileInputType;
  isError: false;
  isIdle: false;
  isSelected: true;
  label: UseFileLabelType;
  matches: (states: UseFileState[]) => boolean;
  preview: ReturnType<typeof URL.createObjectURL> | undefined;
  state: UseFileState.selected;
};

type UseFileError = {
  actions: UseFileActionsType;
  data: null;
  input: UseFileInputType;
  isError: true;
  isIdle: false;
  isSelected: false;
  label: UseFileLabelType;
  matches: (states: UseFileState[]) => boolean;
  state: UseFileState.error;
};

export type UseFileReturnType = UseFileIdle | UseFileSelected | UseFileError;

export function useFile(name: UseFileNameType, config?: UseFileConfigType): UseFileReturnType {
  const maxSizeBytes = config?.maxSizeBytes ?? Number.POSITIVE_INFINITY;

  const [key, setKey] = useState(0);
  const [state, setState] = useState<UseFileState>(UseFileState.idle);
  const [file, setFile] = useState<File | null>(null);

  function selectFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files;

    if (!files?.[0]) return;

    const file = files[0];

    if (file.size > maxSizeBytes) {
      setState(UseFileState.error);
      return;
    }

    setFile(file);
    setState(UseFileState.selected);

    return file;
  }

  function clearFile() {
    setKey((key) => key + 1);
    setFile(null);
    setState(UseFileState.idle);
  }

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : undefined), [file]);

  function matches(states: UseFileState[]) {
    return states.some((given) => given === state);
  }

  const props = {
    actions: { selectFile, clearFile },
    input: { props: { id: name, name, multiple: false }, key },
    label: { props: { htmlFor: name } },
    matches,
  } as const;

  if (state === UseFileState.idle) {
    return { data: null, isError: false, isIdle: true, isSelected: false, state, ...props };
  }

  if (state === UseFileState.selected) {
    return { data: file as File, isError: false, isIdle: false, isSelected: true, preview, state, ...props };
  }

  return { data: null, isError: true, isIdle: false, isSelected: false, state, ...props };
}
