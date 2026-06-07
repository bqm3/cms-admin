import { useMemo } from "react";
import { Editor } from "@tinymce/tinymce-react";
import api, { SERVER_URL } from "../../services/api";

interface TinyMceEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
}

function resolveAssetUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("blob:")) return url;
  return `${SERVER_URL}${url}`;
}

export function TinyMceEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  editable = true,
}: TinyMceEditorProps) {
  const contentStyle = useMemo(
    () => `
      body {
        font-family: Inter, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.8;
        color: #334155;
        margin: 16px;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      table td,
      table th {
        border: 1px solid #e2e8f0;
        padding: 10px 12px;
      }
      blockquote {
        border-left: 4px solid #cbd5e1;
        margin-left: 0;
        padding-left: 16px;
        color: #64748b;
      }
      pre {
        background: #0f172a;
        color: #e2e8f0;
        padding: 16px;
        border-radius: 12px;
        overflow: auto;
      }
      a {
        color: #2563eb;
      }
    `,
    [],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <Editor
        licenseKey="gpl"
        value={value}
        onEditorChange={(content) => onChange(content)}
        disabled={!editable}
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        init={{
          height: 520,
          menubar: "file edit view insert format tools table help",
          placeholder,
          branding: false,
          promotion: false,
          skin: "oxide",
          content_css: "default",
          plugins: [
            "advlist",
            "anchor",
            "autolink",
            "autoresize",
            "code",
            "fullscreen",
            "image",
            "link",
            "lists",
            "table",
            "paste",
            "visualblocks",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image table | removeformat code fullscreen",
          toolbar_sticky: true,
          toolbar_mode: "sliding",
          block_formats:
            "Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Blockquote=blockquote; Preformatted=pre",
          font_family_formats:
            "Default=; Inter=Inter, Arial, sans-serif; Arial=Arial, sans-serif; Georgia=Georgia, serif; Times New Roman=Times New Roman, serif; Courier New=Courier New, monospace",
          fontsize_formats: "12px 14px 16px 18px 20px 24px 28px 32px 40px 48px",
          paste_as_text: false,
          paste_data_images: true,
          paste_merge_formats: false,
          paste_webkit_styles: "all",
          paste_retain_style_properties: "all",
          convert_urls: false,
          relative_urls: false,
          remove_script_host: false,
          verify_html: false,
          valid_elements: "*[*]",
          extended_valid_elements:
            "a[*],abbr[*],address[*],article[*],aside[*],audio[*],b[*],blockquote[*],br[*],button[*],caption[*],center[*],code[*],col[*],colgroup[*],div[*],dl[*],dt[*],dd[*],em[*],figcaption[*],figure[*],footer[*],h1[*],h2[*],h3[*],h4[*],h5[*],h6[*],hr[*],i[*],img[*],input[*],label[*],li[*],main[*],nav[*],ol[*],p[*],pre[*],section[*],small[*],span[*],strong[*],sub[*],sup[*],table[*],tbody[*],td[*],textarea[*],tfoot[*],th[*],thead[*],tr[*],u[*],ul[*],video[*]",
          invalid_elements: "script,style,noscript,iframe,object,embed,meta,link",
          content_style: contentStyle,
          images_upload_handler: async (blobInfo) => {
            const formData = new FormData();
            formData.append("files", blobInfo.blob(), blobInfo.filename());
            formData.append("name", blobInfo.filename());

            const res = await api.post("/media", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            const media = Array.isArray(res.data) ? res.data[0] : res.data;
            const url = resolveAssetUrl(media?.url || "");
            if (!url) {
              throw new Error("Upload image failed");
            }
            return url;
          },
          file_picker_types: "image",
          file_picker_callback: (callback, _value, meta) => {
            if (meta.filetype !== "image") return;
            const url = window.prompt("Nhập URL ảnh", "https://");
            if (url) callback(url, { alt: "" });
          },
        }}
      />
    </div>
  );
}
