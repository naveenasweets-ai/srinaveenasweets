import { useEffect, useRef, useState } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButton = {
  label: React.ReactNode;
  title: string;
  command: string;
  value?: string;
  block?: boolean;
};

const toolbarGroups: ToolbarButton[][] = [
  [
    { label: <strong>B</strong>, title: 'Bold', command: 'bold' },
    { label: <em>I</em>, title: 'Italic', command: 'italic' },
    { label: <u>U</u>, title: 'Underline', command: 'underline' },
    { label: <s>S</s>, title: 'Strikethrough', command: 'strikeThrough' },
  ],
  [
    {
      label: 'H1',
      title: 'Heading 1',
      command: 'formatBlock',
      value: 'H1',
      block: true,
    },
    {
      label: 'H2',
      title: 'Heading 2',
      command: 'formatBlock',
      value: 'H2',
      block: true,
    },
    {
      label: 'H3',
      title: 'Heading 3',
      command: 'formatBlock',
      value: 'H3',
      block: true,
    },
    {
      label: '¶',
      title: 'Paragraph',
      command: 'formatBlock',
      value: 'P',
      block: true,
    },
  ],
  [
    { label: '• List', title: 'Bulleted list', command: 'insertUnorderedList' },
    { label: '1. List', title: 'Numbered list', command: 'insertOrderedList' },
    {
      label: '❝',
      title: 'Quote',
      command: 'formatBlock',
      value: 'BLOCKQUOTE',
      block: true,
    },
  ],
  [
    { label: 'Left', title: 'Align left', command: 'justifyLeft' },
    { label: 'Center', title: 'Align center', command: 'justifyCenter' },
    { label: 'Right', title: 'Align right', command: 'justifyRight' },
  ],
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Keep the DOM in sync when the value changes from outside (e.g. switching
  // tabs), but avoid clobbering the caret while the user is typing.
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
  }, [value]);

  const emitChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const runCommand = (button: ToolbarButton) => {
    editorRef.current?.focus();
    if (button.command === 'formatBlock' && button.value) {
      document.execCommand('formatBlock', false, button.value);
    } else {
      document.execCommand(button.command, false, button.value);
    }
    emitChange();
  };

  const handleCreateLink = () => {
    editorRef.current?.focus();
    const url = window.prompt('Enter the URL (e.g. https://example.com)');
    if (!url) return;
    const safeUrl = /^(https?:|mailto:|tel:|\/)/i.test(url)
      ? url
      : `https://${url}`;
    document.execCommand('createLink', false, safeUrl);
    emitChange();
  };

  const handleRemoveLink = () => {
    editorRef.current?.focus();
    document.execCommand('unlink');
    emitChange();
  };

  const handleClearFormatting = () => {
    editorRef.current?.focus();
    document.execCommand('removeFormat');
    emitChange();
  };

  const showPlaceholder =
    !isFocused && (!value || value === '<br>' || value === '<p></p>');

  return (
    <div className="rounded-xl max-h-105 border border-[#e8c86c] bg-[#fffdf7] overflow-hidden focus-within:border-[#5f1021] focus-within:ring-2 focus-within:ring-[#f3d48a] transition">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#e8c86c]/70 bg-[#fff8ef] p-1.5">
        {toolbarGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="flex items-center gap-1 pr-1.5 mr-1 last:mr-0 last:pr-0 border-r last:border-r-0 border-[#e8c86c]/60"
          >
            {group.map((button) => (
              <button
                key={button.title}
                type="button"
                title={button.title}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => runCommand(button)}
                className="min-w-8 h-8 px-2 rounded-md text-xs font-semibold text-[#5f1021] hover:bg-[#f3d48a]/50 transition"
              >
                {button.label}
              </button>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Insert link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleCreateLink}
            className="h-8 px-2 rounded-md text-xs font-semibold text-[#5f1021] hover:bg-[#f3d48a]/50 transition"
          >
            🔗 Link
          </button>
          <button
            type="button"
            title="Remove link"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleRemoveLink}
            className="h-8 px-2 rounded-md text-xs font-semibold text-[#5f1021] hover:bg-[#f3d48a]/50 transition"
          >
            Unlink
          </button>
          <button
            type="button"
            title="Clear formatting"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleClearFormatting}
            className="h-8 px-2 rounded-md text-xs font-semibold text-[#5f1021] hover:bg-[#f3d48a]/50 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="relative">
        {showPlaceholder && placeholder && (
          <div className="pointer-events-none absolute left-3 top-3 text-sm text-[#b7997a]">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          onInput={emitChange}
          onBlur={() => {
            setIsFocused(false);
            emitChange();
          }}
          onFocus={() => setIsFocused(true)}
          className="legal-rich-text max-h-105 overflow-y-auto p-3 pb-12 text-[#4d2b1f] outline-none"
        />
      </div>
    </div>
  );
}
