import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Highlight from "@tiptap/extension-highlight";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Typography from "@tiptap/extension-typography";
import { Extension } from "@tiptap/core";
import { Fragment, Node as ProseMirrorNode, Slice } from "@tiptap/pm/model";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Heading1,
  Heading4,
  Heading5,
  Heading6,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Highlighter,
  Pilcrow,
  Quote,
  Plus,
  Redo2,
  RemoveFormatting,
  Minus,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import api, { SERVER_URL } from "../../services/api";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  pasteTextAlign?: "left" | "center" | "right" | "justify";
}

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter, sans-serif" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times", value: '"Times New Roman", serif' },
  { label: "Courier", value: '"Courier New", monospace' },
];

const TextColor = Extension.create({
  name: "textColor",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          color: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.color || null,
            renderHTML: (attributes) => {
              if (!attributes.color) return {};
              return { style: `color: ${attributes.color}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setColor:
        (color: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { color }).run(),
      unsetColor:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { color: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const FontSize = Extension.create({
  name: "fontSize",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }: any) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
    } as any;
  },
});

const TextFormatting = Extension.create({
  name: "textFormatting",
  addGlobalAttributes() {
    return [
      {
        types: ["textStyle"],
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.backgroundColor || null,
            renderHTML: (attributes) => {
              if (!attributes.backgroundColor) return {};
              return { style: `background-color: ${attributes.backgroundColor}` };
            },
          },
          fontWeight: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.fontWeight || null,
            renderHTML: (attributes) => {
              if (!attributes.fontWeight) return {};
              return { style: `font-weight: ${attributes.fontWeight}` };
            },
          },
          fontStyle: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.fontStyle || null,
            renderHTML: (attributes) => {
              if (!attributes.fontStyle) return {};
              return { style: `font-style: ${attributes.fontStyle}` };
            },
          },
          textDecoration: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.textDecoration || null,
            renderHTML: (attributes) => {
              if (!attributes.textDecoration) return {};
              return { style: `text-decoration: ${attributes.textDecoration}` };
            },
          },
          lineHeight: {
            default: null,
            parseHTML: (element) => (element as HTMLElement).style.lineHeight || null,
            renderHTML: (attributes) => {
              if (!attributes.lineHeight) return {};
              return { style: `line-height: ${attributes.lineHeight}` };
            },
          },
        },
      },
    ];
  },
});

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${SERVER_URL}${url}`;
}

function ToolbarButton({
  title,
  active,
  disabled,
  onPress,
  children,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onPress();
      }}
      className={[
        "inline-flex h-9 items-center justify-center gap-1 rounded-md border px-2.5 text-sm font-semibold transition",
        active
          ? "border-[#21294a] bg-[#21294a] text-white shadow-sm"
          : "border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-slate-200" />;
}

function ToolbarGroupLabel({ children }: { children: React.ReactNode }) {
  return <span className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{children}</span>;
}

function sanitizePastedHtml(html: string) {
  if (!html) return html;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("script,style,noscript,iframe,object,embed,meta,link").forEach((node) => node.remove());

  return doc.body.innerHTML;
}

function alignPastedNode(
  node: ProseMirrorNode,
  textAlign: TiptapEditorProps["pasteTextAlign"],
): ProseMirrorNode {
  if (!textAlign || node.isText) return node;

  const nextContent: Fragment = node.content.size
    ? Fragment.fromArray(
        (node.content.content as ProseMirrorNode[]).map((child) => alignPastedNode(child, textAlign)),
      )
    : node.content;

  if (node.type.name === "paragraph" || node.type.name === "heading") {
    return node.type.create(
      {
        ...node.attrs,
        textAlign,
      },
      nextContent,
      node.marks,
    );
  }

  return node.copy(nextContent);
}

function alignPastedSlice(slice: Slice, textAlign: TiptapEditorProps["pasteTextAlign"]): Slice {
  if (!textAlign) return slice;

  const content = Fragment.fromArray(
    (slice.content.content as ProseMirrorNode[]).map((node) => alignPastedNode(node, textAlign)),
  );

  return new Slice(content, slice.openStart, slice.openEnd);
}

export function TiptapEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  editable = true,
  pasteTextAlign,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const editor = useEditor({
    editable,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bulletList: {
          keepMarks: true,
          keepAttributes: true,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: true,
        },
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-xl bg-slate-900 px-4 py-3 font-mono text-sm text-slate-100",
          },
        },
      }),
      TextStyle,
      TextColor,
      FontSize,
      TextFormatting,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      Underline,
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Typography,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-[280px] max-w-none px-5 py-4 text-[15px] leading-7 text-slate-700 outline-none prose prose-slate prose-sm md:prose-base prose-headings:tracking-tight prose-p:my-3 prose-ul:my-3 prose-ol:my-3 prose-img:rounded-xl prose-img:shadow-sm prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-slate-200 prose-th:bg-slate-100 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2",
      },
      transformPastedHTML: sanitizePastedHtml,
      transformPasted: (slice) => alignPastedSlice(slice, pasteTextAlign),
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() === value) return;
    editor.commands.setContent(value || "", false);
  }, [editor, value]);

  if (!editor) return null;

  const currentColor = editor.getAttributes("textStyle").color || "#1e293b";
  const currentFontSize = editor.getAttributes("textStyle").fontSize || "16px";
  const currentFontFamily = editor.getAttributes("textStyle").fontFamily || "";

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Nhập URL", previousUrl || "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const insertImageByUrl = () => {
    const url = window.prompt("Nhập đường dẫn ảnh", "https://");
    if (!url || !url.trim()) return;
    editor.chain().focus().setImage({ src: url.trim() }).run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const handleUploadImage = async (file?: File | null) => {
    if (!file) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append("files", file);
      formData.append("name", file.name);

      const res = await api.post("/media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const media = Array.isArray(res.data) ? res.data[0] : res.data;
      const src = resolveAssetUrl(media.url || "");
      if (src) {
        editor.chain().focus().setImage({ src }).run();
      }
    } catch (error) {
      console.error(error);
      alert("Upload ảnh vào description thất bại");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {editable && (
        <>
          <div className="border-b border-slate-200 bg-[#f8f9fb] px-3 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <ToolbarGroupLabel>Block</ToolbarGroupLabel>
              <ToolbarButton
                title="Paragraph"
                active={editor.isActive("paragraph")}
                onPress={() => editor.chain().focus().setParagraph().run()}
              >
                <Pilcrow size={16} />
                <span className="hidden sm:inline">P</span>
              </ToolbarButton>
              <ToolbarButton
                title="Heading 1"
                active={editor.isActive("heading", { level: 1 })}
                onPress={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              >
                <Heading1 size={16} />
                <span className="hidden sm:inline">H1</span>
              </ToolbarButton>
              <ToolbarButton
                title="Heading 2"
                active={editor.isActive("heading", { level: 2 })}
                onPress={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              >
                <Heading2 size={16} />
                <span className="hidden sm:inline">H2</span>
              </ToolbarButton>
              <ToolbarButton
                title="Heading 3"
                active={editor.isActive("heading", { level: 3 })}
                onPress={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              >
                <Heading3 size={16} />
                <span className="hidden sm:inline">H3</span>
              </ToolbarButton>
              <ToolbarButton
                title="Heading 4"
                active={editor.isActive("heading", { level: 4 })}
                onPress={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              >
                <Heading4 size={16} />
                <span className="hidden sm:inline">H4</span>
              </ToolbarButton>
              <ToolbarButton
                title="Heading 5"
                active={editor.isActive("heading", { level: 5 })}
                onPress={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
              >
                <Heading5 size={16} />
                <span className="hidden sm:inline">H5</span>
              </ToolbarButton>
              <ToolbarButton
                title="Heading 6"
                active={editor.isActive("heading", { level: 6 })}
                onPress={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
              >
                <Heading6 size={16} />
                <span className="hidden sm:inline">H6</span>
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton title="Bold" active={editor.isActive("bold")} onPress={() => editor.chain().focus().toggleBold().run()}>
                <Bold size={16} />
              </ToolbarButton>
              <ToolbarButton title="Italic" active={editor.isActive("italic")} onPress={() => editor.chain().focus().toggleItalic().run()}>
                <Italic size={16} />
              </ToolbarButton>
              <ToolbarButton title="Underline" active={editor.isActive("underline")} onPress={() => editor.chain().focus().toggleUnderline().run()}>
                <UnderlineIcon size={16} />
              </ToolbarButton>
              <ToolbarButton title="Strike" active={editor.isActive("strike")} onPress={() => editor.chain().focus().toggleStrike().run()}>
                <Strikethrough size={16} />
              </ToolbarButton>
              <ToolbarButton title="Code" active={editor.isActive("code")} onPress={() => editor.chain().focus().toggleCode().run()}>
                <Code2 size={16} />
              </ToolbarButton>
              <ToolbarButton title="Highlight" active={editor.isActive("highlight")} onPress={() => editor.chain().focus().toggleHighlight().run()}>
                <Highlighter size={16} />
              </ToolbarButton>
              <ToolbarButton title="Subscript" active={editor.isActive("subscript")} onPress={() => editor.chain().focus().toggleSubscript().run()}>
                <SubscriptIcon size={16} />
              </ToolbarButton>
              <ToolbarButton title="Superscript" active={editor.isActive("superscript")} onPress={() => editor.chain().focus().toggleSuperscript().run()}>
                <SuperscriptIcon size={16} />
              </ToolbarButton>
              <ToolbarButton title="Quote" active={editor.isActive("blockquote")} onPress={() => editor.chain().focus().toggleBlockquote().run()}>
                <Quote size={16} />
              </ToolbarButton>
              <ToolbarButton title="Horizontal rule" onPress={() => editor.chain().focus().setHorizontalRule().run()}>
                <Minus size={16} />
              </ToolbarButton>
              <ToolbarButton title="Hard break" onPress={() => editor.chain().focus().setHardBreak().run()}>
                <span className="text-xs font-black">↵</span>
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton title="Bullet List" active={editor.isActive("bulletList")} onPress={() => editor.chain().focus().toggleBulletList().run()}>
                <List size={16} />
              </ToolbarButton>
              <ToolbarButton title="Ordered List" active={editor.isActive("orderedList")} onPress={() => editor.chain().focus().toggleOrderedList().run()}>
                <ListOrdered size={16} />
              </ToolbarButton>
              <ToolbarButton title="Task List" active={editor.isActive("taskList")} onPress={() => editor.chain().focus().toggleTaskList().run()}>
                <span className="text-xs font-black">☑</span>
              </ToolbarButton>
              <ToolbarButton title="Link" active={editor.isActive("link")} onPress={setLink}>
                <Link2 size={16} />
              </ToolbarButton>

              <ToolbarDivider />

              <div className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-2">
                <span className="text-xs font-semibold text-slate-500">Color</span>
                <input
                  type="color"
                  value={currentColor}
                  onChange={(e) => (editor.commands as any).setColor(e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                  title="Text color"
                />
              </div>

              <select
                value={currentFontFamily}
                onChange={(e) => {
                  const fontFamily = e.target.value;
                  if (!fontFamily) {
                    (editor.commands as any).unsetFontFamily();
                    return;
                  }
                  (editor.commands as any).setFontFamily(fontFamily);
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                title="Font family"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.label} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>

              <select
                value={currentFontSize}
                onChange={(e) => (editor.commands as any).setFontSize(e.target.value)}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none"
                title="Font size"
              >
                {[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                  <option key={size} value={`${size}px`}>
                    {size}px
                  </option>
                ))}
              </select>

              <ToolbarDivider />

              <ToolbarButton
                title="Align left"
                active={editor.isActive({ textAlign: "left" })}
                onPress={() => editor.chain().focus().setTextAlign("left").run()}
              >
                <AlignLeft size={16} />
              </ToolbarButton>
              <ToolbarButton
                title="Align center"
                active={editor.isActive({ textAlign: "center" })}
                onPress={() => editor.chain().focus().setTextAlign("center").run()}
              >
                <AlignCenter size={16} />
              </ToolbarButton>
              <ToolbarButton
                title="Align right"
                active={editor.isActive({ textAlign: "right" })}
                onPress={() => editor.chain().focus().setTextAlign("right").run()}
              >
                <AlignRight size={16} />
              </ToolbarButton>

              <ToolbarButton title="Insert table" onPress={insertTable}>
                <Table2 size={16} />
              </ToolbarButton>
              <ToolbarButton title="Add row" onPress={() => editor.chain().focus().addRowAfter().run()}>
                <Plus size={16} />
              </ToolbarButton>
              <ToolbarButton title="Add column" onPress={() => editor.chain().focus().addColumnAfter().run()}>
                <Plus size={16} />
              </ToolbarButton>
              <ToolbarButton title="Delete table" onPress={() => editor.chain().focus().deleteTable().run()}>
                <Trash2 size={16} />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton title="Undo" onPress={() => editor.chain().focus().undo().run()}>
                <Undo2 size={16} />
              </ToolbarButton>
              <ToolbarButton title="Redo" onPress={() => editor.chain().focus().redo().run()}>
                <Redo2 size={16} />
              </ToolbarButton>
              <ToolbarButton title="Clear formatting" onPress={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
                <RemoveFormatting size={16} />
              </ToolbarButton>

              <ToolbarDivider />

              <ToolbarButton title="Insert image by URL" onPress={insertImageByUrl}>
                <Link2 size={16} />
                <span className="hidden sm:inline">Img URL</span>
              </ToolbarButton>
              <label
                className={`inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                  uploadingImage
                    ? "border-slate-200 bg-slate-100 text-slate-400"
                    : "border-transparent bg-[#21294a] text-white hover:bg-[#1b2340]"
                }`}
              >
                <ImagePlus size={16} />
                <span>{uploadingImage ? "Đang upload..." : "Tải ảnh"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingImage}
                  onChange={(e) => handleUploadImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-slate-50/60 px-5 py-2 text-xs text-slate-500">
            Chọn text rồi bấm công cụ để format. Có thể đổi màu, cỡ chữ, tải ảnh trực tiếp hoặc chèn bằng URL.
          </div>
        </>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
