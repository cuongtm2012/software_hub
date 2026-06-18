import { useEffect, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Undo2,
  Redo2,
  Unlink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toEditorHtml } from "@/lib/blog-content";

interface BlogRichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className="h-8 w-8 p-0 shrink-0"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </Button>
  );
}

export function BlogRichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Viết nội dung bài viết...",
  className,
}: BlogRichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: toEditorHtml(value),
    editorProps: {
      attributes: {
        class:
          "blog-content prose prose-sm max-w-none min-h-[300px] px-3 py-2 focus:outline-none dark:prose-invert",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextHtml = toEditorHtml(value);
    const currentHtml = editor.getHTML();
    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [editor, value]);

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Nhập URL liên kết:", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  if (!editor) {
    return (
      <div
        className={cn(
          "mt-1 flex flex-1 min-h-[360px] items-center justify-center rounded-md border border-input bg-muted/30 text-sm text-muted-foreground",
          className,
        )}
      >
        Đang tải trình soạn thảo...
      </div>
    );
  }

  return (
    <div
      id={id}
      className={cn(
        "mt-1 flex flex-col flex-1 min-h-[calc(100dvh-320px)] rounded-md border border-input bg-background overflow-hidden",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 px-2 py-1.5">
        <ToolbarButton
          title="In đậm"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="In nghiêng"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Gạch chân"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          title="Tiêu đề H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Tiêu đề H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          title="Danh sách bullet"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Danh sách đánh số"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Trích dẫn"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          title="Thêm liên kết"
          active={editor.isActive("link")}
          onClick={setLink}
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Xóa liên kết"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink className="h-4 w-4" />
        </ToolbarButton>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <ToolbarButton
          title="Hoàn tác"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Làm lại"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full [&_.ProseMirror]:min-h-[300px]" />
      </div>
    </div>
  );
}
