import type { editor } from "monaco-editor";

/**
 * Builds an ot.js-compatible TextOperation JSON array (retain = positive int,
 * insert = string, delete = negative int) from a Monaco change event.
 */
export function monacoChangesToOtJson(
  e: editor.IModelContentChangedEvent,
  documentLengthBefore: number,
): (string | number)[] | null {
  if (!e.changes.length) return null;
  const ops: (string | number)[] = [];
  let cursor = 0;
  const sorted = [...e.changes].sort(
    (a, b) => a.rangeOffset - b.rangeOffset,
  );

  const pushRetain = (n: number) => {
    if (n <= 0) return;
    const last = ops[ops.length - 1];
    if (typeof last === "number" && last > 0) ops[ops.length - 1] = last + n;
    else ops.push(n);
  };
  const pushDelete = (n: number) => {
    if (n <= 0) return;
    ops.push(-n);
  };
  const pushInsert = (s: string) => {
    if (!s) return;
    const last = ops[ops.length - 1];
    if (typeof last === "string") ops[ops.length - 1] = last + s;
    else ops.push(s);
  };

  for (const ch of sorted) {
    pushRetain(ch.rangeOffset - cursor);
    if (ch.rangeLength > 0) pushDelete(ch.rangeLength);
    if (ch.text) pushInsert(ch.text);
    cursor = ch.rangeOffset + ch.rangeLength;
  }
  pushRetain(documentLengthBefore - cursor);
  if (ops.length === 0) return null;
  return ops;
}
